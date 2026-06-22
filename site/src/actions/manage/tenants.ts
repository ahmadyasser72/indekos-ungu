import { db, eq } from "@e-kos/database";
import {
	auditDetail,
	auditLogs,
	leases,
	tenants,
} from "@e-kos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { toCamelCaseKeys } from "es-toolkit/object";

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
		const phone = input.phone_number.replace(/\D/g, "").replace(/^0/, "");
		const phoneNumber = phone.startsWith("62") ? phone : `62${phone}`;

		const samePhone = await db.query.tenants.findFirst({
			columns: { id: true },
			where: { phoneNumber },
		});
		if (samePhone?.id) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor HP sudah terdaftar.",
			});
		}

		// Run in a transaction synchronously for SQLite sync driver
		const insertedTenant = db.transaction((tx) => {
			// Check if room is already occupied using standard sync query
			const activeLease = tx.query.leases
				.findFirst({
					columns: { id: true },
					where: { roomId: input.room_id, isActive: true },
				})
				.sync();

			if (activeLease?.id) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Kamar sudah terisi.",
				});
			}

			const [inserted] = tx
				.insert(tenants)
				.values({
					fullName: input.full_name,
					phoneNumber: phoneNumber,
					originRegion: input.origin_region || null,
				})
				.returning({ id: tenants.id })
				.all();

			if (!inserted) {
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Gagal menyimpan data penghuni baru.",
				});
			}

			tx.insert(leases)
				.values({
					tenantId: inserted.id,
					roomId: input.room_id,
					startDate: new Date(input.start_date),
					endDate: input.end_date ? new Date(input.end_date) : null,
					isActive: true,
				})
				.run();

			return inserted;
		});

		const user = await context.session?.get("user");
		await db.insert(auditLogs).values({
			userId: user?.id ?? null,
			action: "CREATE",
			tableName: "tenants",
			recordId: insertedTenant.id,
			details: auditDetail.create(
				`Mendaftarkan tenant ${input.full_name} (${input.phone_number}) di kamar ID ${input.room_id}`,
				toCamelCaseKeys(input),
			),
		});

		return insertedTenant;
	},
});

export const terminate = defineAction({
	accept: "form",
	input: z.object({ id: z.coerce.number() }),
	handler: async (input, context) => {
		const activeLease = await db.query.leases.findFirst({
			columns: { id: true, startDate: true, endDate: true, isActive: true },
			where: { tenantId: input.id, isActive: true },
		});
		if (!activeLease?.id) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak memiliki kontrak sewa aktif.",
			});
		}

		await db
			.update(leases)
			.set({ isActive: false, endDate: new Date() })
			.where(eq(leases.id, activeLease.id));

		const user = await context.session?.get("user");
		await db.insert(auditLogs).values({
			userId: user?.id ?? null,
			action: "UPDATE",
			tableName: "leases",
			recordId: activeLease.id,
			details: auditDetail.update(
				`Mengakhiri kontrak sewa tenant ID ${input.id}`,
				activeLease,
				{ ...activeLease, isActive: false, endDate: new Date() },
			),
		});

		return { id: input.id };
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
			.transform((s) => s ?? null),
	}),
	handler: async (input, context) => {
		const target = await db.query.tenants.findFirst({
			columns: {
				id: true,
				fullName: true,
				phoneNumber: true,
				originRegion: true,
			},
			where: { id: input.id },
		});
		if (!target)
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});

		const phone = input.phone_number.replace(/\D/g, "").replace(/^0/, "");
		const phoneNumber = phone.startsWith("62") ? phone : `62${phone}`;

		const samePhone = await db.query.tenants.findFirst({
			columns: { id: true },
			where: { phoneNumber, id: { ne: input.id } },
		});
		if (samePhone?.id) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor HP sudah terdaftar.",
			});
		}

		const [updated] = await db
			.update(tenants)
			.set({
				fullName: input.full_name,
				phoneNumber,
				originRegion: input.origin_region || null,
			})
			.where(eq(tenants.id, input.id))
			.returning({ id: tenants.id });

		const user = await context.session?.get("user");
		await db.insert(auditLogs).values({
			userId: user?.id ?? null,
			action: "UPDATE",
			tableName: "tenants",
			recordId: updated.id,
			details: auditDetail.update(
				`Mengubah data penghuni ${input.full_name} (${phoneNumber})`,
				target,
				toCamelCaseKeys(input),
			),
		});

		return updated;
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
		const target = await db.query.tenants.findFirst({
			columns: { id: true, fullName: true },
			where: { id: input.id },
		});
		if (!target)
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});

		const activeLease = await db.query.leases.findFirst({
			columns: { id: true },
			where: { tenantId: input.id, isActive: true },
		});
		if (activeLease)
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni masih memiliki kontrak sewa aktif.",
			});

		db.transaction((tx) => {
			const roomTaken = tx.query.leases
				.findFirst({
					columns: { id: true },
					where: { roomId: input.room_id, isActive: true },
				})
				.sync();

			if (roomTaken) {
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

		const user = await context.session?.get("user");
		await db.insert(auditLogs).values({
			userId: user?.id ?? null,
			action: "CREATE",
			tableName: "leases",
			recordId: input.id,
			details: auditDetail.create(
				`Mendaftarkan ulang tenant ${target.fullName} ke kamar ID ${input.room_id}`,
				toCamelCaseKeys(input),
			),
		});

		return { id: input.id };
	},
});

export const move = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		room_id: z.coerce.number(),
		start_date: z.string(),
	}),
	handler: async (input, context) => {
		const target = await db.query.tenants.findFirst({
			columns: { id: true, fullName: true },
			where: { id: input.id },
		});
		if (!target)
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak ditemukan.",
			});

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
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Penghuni tidak memiliki kontrak sewa aktif.",
			});
		}

		db.transaction((tx) => {
			// Check if target room is available
			const roomTaken = tx.query.leases
				.findFirst({
					columns: { id: true },
					where: { roomId: input.room_id, isActive: true },
				})
				.sync();

			if (roomTaken) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Kamar tujuan sudah terisi.",
				});
			}

			tx.update(leases)
				.set({ isActive: false, endDate: new Date() })
				.where(eq(leases.id, oldLease.id))
				.run();

			tx.insert(leases)
				.values({
					tenantId: input.id,
					roomId: input.room_id,
					startDate: new Date(input.start_date),
					endDate: null,
					isActive: true,
				})
				.run();
		});

		const user = await context.session?.get("user");
		await db.insert(auditLogs).values({
			userId: user?.id ?? null,
			action: "UPDATE",
			tableName: "leases",
			recordId: input.id,
			details: auditDetail.update(
				`Memindahkan tenant ${target.fullName} dari kamar ${oldLease.roomId} ke kamar ${input.room_id}`,
				oldLease,
				{
					...oldLease,
					roomId: input.room_id,
					startDate: new Date(input.start_date),
					endDate: null,
				},
			),
		});

		return { id: input.id };
	},
});
