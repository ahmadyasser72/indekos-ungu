import { and, db, eq, inArray } from "@indekos/database";
import { generatePaymentLink } from "@indekos/database/duitku/invoice-payment";
import {
	auditDetail,
	invoices,
	leases,
	notifications,
	tenants,
} from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { toCamelCaseKeys } from "es-toolkit/object";

export * as chat from "./tenants-chat";

const normalizePhone = (raw: string): string => {
	const stripped = raw.replace(/\D/g, "").replace(/^0/, "");
	return stripped.startsWith("62") ? stripped : `62${stripped}`;
};

const validateLeaseDuration = (startDate: string, endDate?: string): void => {
	if (!endDate) return;

	const start = dayjs(startDate);
	const end = dayjs(endDate);
	const minEndDate = start.add(1, "month");

	if (end.isBefore(minEndDate)) {
		throw new ActionError({
			code: "BAD_REQUEST",
			message: "Durasi sewa minimal 1 bulan dari tanggal mulai.",
		});
	}
};

export const add = defineAction({
	accept: "form",
	input: z.object({
		full_name: z.string(),
		phone_number: z.string(),
		origin_region: z.string().optional(),
		room_id: z.coerce.number(),
		start_date: z.string(),
		end_date: z.string().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenants:add",
		});
		const phoneNumber = normalizePhone(input.phone_number);

		validateLeaseDuration(input.start_date, input.end_date);

		const samePhone = await db.query.tenants.findFirst({
			columns: { id: true },
			where: { phoneNumber },
		});
		if (samePhone?.id) {
			log.error({ phoneNumber }, "phone already registered");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor HP sudah terdaftar.",
			});
		}

		log.info(
			{ fullName: input.full_name, roomId: input.room_id },
			"attempting to add tenant with active lease",
		);

		try {
			// Run in a transaction synchronously for SQLite sync driver
			const { insertedTenant, insertedLease } = db.transaction((tx) => {
				const activeLease = tx.query.leases
					.findFirst({
						columns: { id: true },
						where: { roomId: input.room_id, isActive: true },
					})
					.sync();

				if (activeLease?.id) {
					log.error({ roomId: input.room_id }, "room already occupied");
					throw new ActionError({
						code: "BAD_REQUEST",
						message: "Kamar sudah ditempati.",
					});
				}

				const [inserted] = tx
					.insert(tenants)
					.values({
						fullName: input.full_name,
						phoneNumber: phoneNumber,
						originRegion: input.origin_region || null,
						isVerified: false,
					})
					.returning({ id: tenants.id })
					.all();

				if (!inserted) {
					log.error("failed to insert tenant");
					throw new ActionError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Gagal menyimpan data penghuni baru.",
					});
				}

				const [lease] = tx
					.insert(leases)
					.values({
						tenantId: inserted.id,
						roomId: input.room_id,
						startDate: new Date(input.start_date),
						endDate: input.end_date ? new Date(input.end_date) : null,
						isActive: true,
					})
					.returning({ id: leases.id })
					.all();

				const room = tx.query.rooms
					.findFirst({
						where: { id: input.room_id },
						columns: { monthlyPrice: true },
					})
					.sync();

				if (room?.monthlyPrice && lease) {
					const startDate = dayjs(input.start_date);
					const dueDate = startDate.add(3, "days").toDate();

					tx.insert(invoices)
						.values({
							leaseId: lease.id,
							amount: room.monthlyPrice,
							dueDate,
							status: "unpaid",
						})
						.run();
				}

				return { insertedTenant: inserted, insertedLease: lease };
			});

			await context.locals.logAudit(
				"CREATE",
				"tenants",
				insertedTenant.id,
				auditDetail.create(
					`Mendaftarkan tenant ${input.full_name} (+${phoneNumber}) di kamar ID ${input.room_id}`,
					toCamelCaseKeys(input),
				),
			);

			// Query the invoice we just created
			const createdInvoice = await db.query.invoices.findFirst({
				where: { leaseId: insertedLease.id },
				columns: { id: true },
			});

			if (!createdInvoice?.id) {
				log.error(
					"failed to find invoice for new lease, aborting tenant creation",
				);
				await db.delete(tenants).where(eq(tenants.id, insertedTenant.id));
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"Gagal membuat invoice untuk penghuni baru. Penghuni tidak jadi ditambahkan.",
				});
			}

			// Generate Duitku payment link — abort entire tenant creation if this fails
			try {
				await generatePaymentLink(createdInvoice.id, context.locals.user?.id, {
					logger: log,
				});
			} catch (error) {
				log.error(
					{ error },
					"failed to generate payment link, aborting tenant creation",
				);
				await db.delete(tenants).where(eq(tenants.id, insertedTenant.id));
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"Gagal membuat link pembayaran. Penghuni tidak jadi ditambahkan.",
				});
			}

			await db.insert(notifications).values({
				tenantId: insertedTenant.id,
				roomId: input.room_id,
				invoiceId: createdInvoice.id,
				type: "welcome",
				status: "pending",
			});

			log.info(
				{ tenantId: insertedTenant.id },
				"tenant and lease created successfully",
			);
			return insertedTenant;
		} catch (error) {
			log.error({ error, phoneNumber }, "failed to add tenant");
			throw error;
		}
	},
});

export const terminate = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		end_date: z.string().optional(),
	}),
	handler: async ({ id, end_date }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenants:terminate",
		});
		const activeLease = await db.query.leases.findFirst({
			columns: { id: true, startDate: true, endDate: true, isActive: true },
			where: { tenantId: id, isActive: true },
		});
		if (!activeLease?.id) {
			log.error({ tenantId: id }, "no active lease found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak memiliki kontrak sewa aktif.",
			});
		}

		if (end_date && dayjs(end_date).isBefore(activeLease.startDate)) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Tanggal selesai tidak boleh sebelum tanggal mulai sewa.",
			});
		}

		log.info(
			{ tenantId: id, leaseId: activeLease.id },
			"attempting to terminate lease",
		);

		try {
			const endDate = end_date ? new Date(end_date) : new Date();

			await db
				.update(leases)
				.set({ isActive: false, endDate })
				.where(eq(leases.id, activeLease.id));

			await context.locals.logAudit(
				"UPDATE",
				"leases",
				activeLease.id,
				auditDetail.update(
					`Mengakhiri kontrak sewa tenant ID ${id}`,
					activeLease,
					{ ...activeLease, isActive: false, endDate },
				),
			);

			log.info("lease terminated successfully");
			return { id };
		} catch (error) {
			log.error({ error, tenantId: id }, "failed to terminate lease");
			throw error;
		}
	},
});

export const edit = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		full_name: z.string(),
		phone_number: z.string(),
		origin_region: z
			.string()
			.optional()
			.transform((s) => s ?? null)
			.catch(null),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenants:edit",
		});
		const target = await db.query.tenants.findFirst({
			columns: {
				id: true,
				fullName: true,
				phoneNumber: true,
				originRegion: true,
			},
			where: { id: input.id },
			with: { lease: true },
		});
		if (!target) {
			log.error({ tenantId: input.id }, "tenant not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});
		}

		const phoneNumber = normalizePhone(input.phone_number);

		const samePhone = await db.query.tenants.findFirst({
			columns: { id: true },
			where: { phoneNumber, id: { ne: input.id } },
		});
		if (samePhone?.id) {
			log.error({ phoneNumber }, "phone already registered");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor HP sudah terdaftar.",
			});
		}

		log.info({ tenantId: input.id }, "attempting to update tenant");

		try {
			const phoneChanged = phoneNumber !== target.phoneNumber;

			const [updated] = await db
				.update(tenants)
				.set({
					fullName: input.full_name,
					phoneNumber,
					originRegion: input.origin_region ?? null,
					...(phoneChanged && { isVerified: false }),
				})
				.where(eq(tenants.id, input.id))
				.returning({ id: tenants.id });

			if (phoneChanged) {
				// Cancel stale phone_change notifications from previous number
				await db
					.update(notifications)
					.set({ status: "failed" })
					.where(
						and(
							eq(notifications.tenantId, updated.id),
							eq(notifications.type, "phone_change"),
							inArray(notifications.status, ["pending", "sent"]),
						),
					);

				await db.insert(notifications).values({
					tenantId: updated.id,
					roomId: target.lease!.roomId,
					type: "phone_change",
					status: "pending",
				});
			}

			const description = phoneChanged
				? `Mengubah data penghuni ${input.full_name} (${phoneNumber}); nomor diubah, reset verifikasi`
				: `Mengubah data penghuni ${input.full_name} (${phoneNumber})`;

			await context.locals.logAudit(
				"UPDATE",
				"tenants",
				updated.id,
				auditDetail.update(description, target, toCamelCaseKeys(input)),
			);

			log.info("tenant updated successfully");
			return updated;
		} catch (error) {
			log.error({ error, tenantId: input.id }, "failed to update tenant");
			throw error;
		}
	},
});

export const register = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		room_id: z.coerce.number(),
		start_date: z.string(),
		end_date: z.string().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenants:register",
		});

		validateLeaseDuration(input.start_date, input.end_date);

		const target = await db.query.tenants.findFirst({
			columns: { id: true, fullName: true },
			where: { id: input.id },
		});
		if (!target) {
			log.error({ tenantId: input.id }, "tenant not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});
		}

		const activeLease = await db.query.leases.findFirst({
			columns: { id: true },
			where: { tenantId: input.id, isActive: true },
		});
		if (activeLease) {
			log.error({ tenantId: input.id }, "tenant already has active lease");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni masih memiliki kontrak sewa aktif.",
			});
		}

		// Validate new lease doesn't overlap with any previous leases
		const existingLeases = await db.query.leases.findMany({
			columns: { id: true, startDate: true, endDate: true },
			with: { room: { columns: { roomNumber: true } } },
			where: { tenantId: input.id },
		});
		const newStart = dayjs(input.start_date).startOf("day");
		const newEnd = input.end_date ? dayjs(input.end_date).endOf("day") : null;
		const overlappingLease = existingLeases.find((lease) => {
			const existingStart = dayjs(lease.startDate).startOf("day");
			const existingEnd = lease.endDate
				? dayjs(lease.endDate).endOf("day")
				: null;
			// overlap when: newStart < existingEnd AND existingStart < newEnd
			// null end = open-ended = treated as infinity
			const newBeforeExistingEnd =
				!existingEnd || newStart.isBefore(existingEnd);
			const existingBeforeNewEnd = !newEnd || existingStart.isBefore(newEnd);
			return newBeforeExistingEnd && existingBeforeNewEnd;
		});
		if (overlappingLease) {
			const fmt = (d: Date) => dayjs(d).format("DD MMM YYYY");
			throw new ActionError({
				code: "BAD_REQUEST",
				message:
					`Bentrok dengan sewa kamar ${overlappingLease.room.roomNumber} ` +
					`(${fmt(overlappingLease.startDate)} – ${overlappingLease.endDate ? fmt(overlappingLease.endDate) : "buka"}).`,
			});
		}

		log.info(
			{ tenantId: input.id, roomId: input.room_id },
			"attempting to re-register tenant with new lease",
		);

		db.transaction((tx) => {
			const roomTaken = tx.query.leases
				.findFirst({
					columns: { id: true },
					where: { roomId: input.room_id, isActive: true },
				})
				.sync();

			if (roomTaken) {
				log.error({ roomId: input.room_id }, "room already occupied");
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Kamar sudah terisi.",
				});
			}

			tx.insert(leases)
				.values({
					tenantId: input.id,
					roomId: input.room_id,
					startDate: new Date(input.start_date),
					endDate: input.end_date ? new Date(input.end_date) : null,
					isActive: true,
				})
				.run();
		});

		await context.locals.logAudit(
			"CREATE",
			"leases",
			input.id,
			auditDetail.create(
				`Mendaftarkan ulang tenant ${target.fullName} ke kamar ID ${input.room_id}`,
				toCamelCaseKeys(input),
			),
		);

		log.info({ tenantId: input.id }, "tenant re-registered successfully");
		return { id: input.id };
	},
});

export const move = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		room_id: z.coerce.number(),
		start_date: z.string(),
		end_date: z.string().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenants:move",
		});

		validateLeaseDuration(input.start_date, input.end_date);

		const target = await db.query.tenants.findFirst({
			columns: { id: true, fullName: true },
			where: { id: input.id },
		});
		if (!target) {
			log.error({ tenantId: input.id }, "tenant not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});
		}

		const oldLease = await db.query.leases.findFirst({
			columns: {
				id: true,
				roomId: true,
				startDate: true,
				endDate: true,
				isActive: true,
			},
			where: { tenantId: input.id, isActive: true },
		});
		if (!oldLease) {
			log.error({ tenantId: input.id }, "no active lease found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak memiliki kontrak sewa aktif.",
			});
		}

		log.info(
			{ tenantId: input.id, roomId: input.room_id },
			"attempting to move tenant to new room",
		);

		const { newLeaseId, additionalInvoiceId, newRoomNumber } = db.transaction(
			(tx) => {
				const roomTaken = tx.query.leases
					.findFirst({
						columns: { id: true },
						where: { roomId: input.room_id, isActive: true },
					})
					.sync();

				if (roomTaken) {
					log.error({ roomId: input.room_id }, "target room occupied");
					throw new ActionError({
						code: "BAD_REQUEST",
						message: "Kamar tujuan sudah terisi.",
					});
				}

				tx.update(leases)
					.set({
						isActive: false,
						endDate: dayjs(input.start_date).subtract(1, "day").toDate(),
					})
					.where(eq(leases.id, oldLease.id))
					.run();

				const [newLease] = tx
					.insert(leases)
					.values({
						tenantId: input.id,
						roomId: input.room_id,
						startDate: new Date(input.start_date),
						endDate: input.end_date ? new Date(input.end_date) : null,
						isActive: true,
					})
					.returning({ id: leases.id })
					.all();

				const newRoom = tx.query.rooms
					.findFirst({
						columns: { monthlyPrice: true, roomNumber: true },
						where: { id: input.room_id },
					})
					.sync();

				const oldRoom = tx.query.rooms
					.findFirst({
						columns: { monthlyPrice: true },
						where: { id: oldLease.roomId },
					})
					.sync();

				// Cancel unpaid invoices on old lease
				const unpaidInvoices = tx.query.invoices
					.findMany({
						columns: { id: true },
						where: { leaseId: oldLease.id, status: "unpaid" },
					})
					.sync();

				for (const inv of unpaidInvoices) {
					tx.update(invoices)
						.set({ status: "overdue" })
						.where(eq(invoices.id, inv.id))
						.run();
				}

				// Always notify tenant about the move
				tx.insert(notifications)
					.values({
						tenantId: input.id,
						roomId: input.room_id,
						type: "move_success",
						status: "pending",
					})
					.run();

				// Create additional invoice for price difference (prorated)
				let additionalInvoiceId: number | null = null;
				let newRoomNumber: string | null = null;

				if (
					newRoom?.monthlyPrice &&
					oldRoom?.monthlyPrice &&
					newRoom.monthlyPrice > oldRoom.monthlyPrice
				) {
					const moveDate = dayjs(input.start_date);
					let cycleStart = dayjs(oldLease.startDate);
					let cycleEnd = cycleStart.add(1, "month");

					// Find the billing cycle containing the move date
					while (!moveDate.isBefore(cycleEnd, "day")) {
						cycleStart = cycleEnd;
						cycleEnd = cycleEnd.add(1, "month");
					}

					const totalCycleDays = cycleEnd.diff(cycleStart, "day");
					const remainingDays = cycleEnd.diff(moveDate, "day");
					const priceDifference = newRoom.monthlyPrice - oldRoom.monthlyPrice;
					const additionalAmount = Math.round(
						(priceDifference * remainingDays) / totalCycleDays,
					);

					if (additionalAmount > 0 && newLease) {
						const dueDate = moveDate.add(3, "days").toDate();

						const [additionalInvoice] = tx
							.insert(invoices)
							.values({
								leaseId: newLease.id,
								amount: additionalAmount,
								dueDate,
								status: "unpaid",
							})
							.returning({ id: invoices.id })
							.all();

						if (additionalInvoice) {
							additionalInvoiceId = additionalInvoice.id;
							newRoomNumber = newRoom.roomNumber;

							tx.insert(notifications)
								.values({
									tenantId: input.id,
									roomId: input.room_id,
									invoiceId: additionalInvoice.id,
									type: "move_additional_payment",
									status: "pending",
								})
								.run();

							log.info(
								{
									tenantId: input.id,
									amount: additionalAmount,
									remainingDays,
								},
								"additional invoice created for price difference",
							);
						}
					}
				}

				return {
					newLeaseId: newLease!.id,
					additionalInvoiceId,
					newRoomNumber,
				};
			},
		);

		// Generate payment link for additional invoice (outside transaction)
		if (additionalInvoiceId) {
			try {
				await generatePaymentLink(
					additionalInvoiceId,
					context.locals.user?.id,
					{ logger: log },
				);
			} catch (error) {
				log.error(
					{ error, invoiceId: additionalInvoiceId },
					"failed to generate payment link for additional invoice",
				);
			}
		}

		await context.locals.logAudit(
			"UPDATE",
			"leases",
			input.id,
			auditDetail.update(
				`Memindahkan tenant ${target.fullName} dari kamar ${oldLease.roomId} ke kamar ${input.room_id}`,
				oldLease,
				{
					...oldLease,
					roomId: input.room_id,
					startDate: new Date(input.start_date),
					endDate: input.end_date ? new Date(input.end_date) : null,
				},
			),
		);

		log.info({ tenantId: input.id }, "tenant moved successfully");
		return { id: input.id };
	},
});
