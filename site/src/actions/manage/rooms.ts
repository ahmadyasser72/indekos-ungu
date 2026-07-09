import { db, eq, ROOM_TYPES } from "@indekos/database";
import { auditDetail, rooms } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { toCamelCaseKeys } from "es-toolkit/object";

export const add = defineAction({
	accept: "form",
	input: z.object({
		room_number: z.string(),
		room_type: z.enum(ROOM_TYPES),
		monthly_price: z.coerce.number(),
		is_active: z.stringbool().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:rooms:add",
		});
		const exists = await db.query.rooms.findFirst({
			columns: { id: true },
			where: { roomNumber: input.room_number },
		});
		if (exists?.id) {
			log.error(
				{ roomNumber: input.room_number },
				"room number already exists",
			);
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor kamar sudah terdaftar.",
			});
		}

		log.info(
			{ roomNumber: input.room_number, roomType: input.room_type },
			"attempting to create room",
		);

		try {
			const [inserted] = await db
				.insert(rooms)
				.values(toCamelCaseKeys(input))
				.returning({ id: rooms.id });

			await context.locals.logAudit(
				"CREATE",
				"rooms",
				inserted.id,
				auditDetail.create(
					`Menambah kamar ${input.room_number} (${input.room_type})`,
					toCamelCaseKeys(input),
				),
			);

			log.info({ roomId: inserted.id }, "room created successfully");
			return inserted;
		} catch (error) {
			log.error(
				{ error, roomNumber: input.room_number },
				"failed to create room",
			);
			throw error;
		}
	},
});

export const edit = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		room_number: z.string(),
		room_type: z.enum(ROOM_TYPES),
		monthly_price: z.coerce.number(),
		is_active: z.stringbool().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:rooms:edit",
		});
		const sameNumber = await db.query.rooms.findFirst({
			columns: { id: true },
			where: { roomNumber: input.room_number, id: { ne: input.id } },
		});
		if (sameNumber?.id) {
			log.error(
				{ roomNumber: input.room_number },
				"room number already exists",
			);
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Nomor kamar sudah terdaftar.",
			});
		}

		const oldRoom = await db.query.rooms.findFirst({
			columns: {
				id: true,
				roomNumber: true,
				roomType: true,
				monthlyPrice: true,
				isActive: true,
			},
			where: { id: input.id },
		});
		if (!oldRoom) {
			log.error({ roomId: input.id }, "room not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Kamar tidak ditemukan.",
			});
		}

		log.info(
			{ roomId: input.id, roomNumber: input.room_number },
			"attempting to update room",
		);

		if (input.is_active === undefined) input.is_active = oldRoom.isActive;

		try {
			const [updated] = await db
				.update(rooms)
				.set(toCamelCaseKeys(input))
				.where(eq(rooms.id, input.id))
				.returning({ id: rooms.id });

			await context.locals.logAudit(
				"UPDATE",
				"rooms",
				updated.id,
				auditDetail.update(
					`Mengubah kamar ${input.room_number} (${input.room_type})`,
					oldRoom,
					toCamelCaseKeys(input),
				),
			);

			log.info("room updated successfully");
			return updated;
		} catch (error) {
			log.error({ error, roomId: input.id }, "failed to update room");
			throw error;
		}
	},
});

export const _delete = defineAction({
	accept: "form",
	input: z.object({ id: z.coerce.number() }),
	handler: async ({ id }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:rooms:delete",
		});
		const target = await db.query.rooms.findFirst({
			columns: {
				id: true,
				roomNumber: true,
				roomType: true,
				monthlyPrice: true,
				isActive: true,
			},
			where: { id },
			with: {
				lease: {
					with: { tenant: true },
				},
			},
		});

		if (!target) {
			log.error({ roomId: id }, "room not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Kamar tidak ditemukan.",
			});
		}
		if (target.lease) {
			log.error(
				{
					roomId: id,
					leaseId: target.lease.id,
					tenantId: target.lease.tenant.id,
				},
				"room still in use",
			);
			throw new ActionError({
				code: "BAD_REQUEST",
				message: `Kamar masih digunakan ${target.lease.tenant.fullName}.`,
			});
		}

		log.info(
			{ roomId: id, roomNumber: target.roomNumber },
			"attempting to delete room",
		);

		try {
			const [deleted] = await db
				.delete(rooms)
				.where(eq(rooms.id, id))
				.returning({ id: rooms.id });

			await context.locals.logAudit(
				"DELETE",
				"rooms",
				deleted.id,
				auditDetail.delete(
					`Menghapus kamar ${target.roomNumber} (${target.roomType})`,
					target,
				),
			);

			log.info("room deleted successfully");
			return deleted;
		} catch (error) {
			log.error({ error, roomId: id }, "failed to delete room");
			throw error;
		}
	},
});
