import { db, eq } from "@indekos/database";
import { auditDetail, users } from "@indekos/database/schema";
import { hashPassword } from "@indekos/utilities/password";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { omit } from "es-toolkit";
import { toCamelCaseKeys } from "es-toolkit/object";

import { ROLES } from "~/lib/auth";

export const add = defineAction({
	accept: "form",
	input: z.object({
		username: z.string(),
		display_name: z.string(),
		password: z.string(),
		role: z.enum(ROLES),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:accounts:add",
		});
		const sameUsername = await db.query.users.findFirst({
			columns: { id: true },
			where: { username: input.username },
		});
		if (sameUsername?.id) {
			log.error({ username: input.username }, "username already taken");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Username tidak tersedia.",
			});
		}

		log.info(
			{ username: input.username, role: input.role },
			"attempting to create user account",
		);

		try {
			const [inserted] = await db
				.insert(users)
				.values({
					username: input.username,
					displayName: input.display_name,
					passwordHash: await hashPassword(input.password),
					role: input.role,
				})
				.returning({ id: users.id });

			await context.locals.logAudit(
				"CREATE",
				"users",
				inserted.id,
				auditDetail.create(
					`Membuat akun user: ${input.username} dengan role: ${input.role}`,
					toCamelCaseKeys(omit(input, ["password"])),
				),
			);

			log.info({ userId: inserted.id }, "user account created successfully");
			return inserted;
		} catch (error) {
			log.error(
				{ error, username: input.username },
				"failed to create user account",
			);
			throw error;
		}
	},
});

export const edit = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		username: z.string(),
		display_name: z.string(),
		password: z.string().optional(),
		role: z.enum(ROLES),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:accounts:edit",
		});
		const sameUsername = await db.query.users.findFirst({
			columns: { id: true },
			where: { username: input.username, id: { ne: input.id } },
		});
		if (sameUsername?.id) {
			log.error({ username: input.username }, "username already taken");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Username tidak tersedia.",
			});
		}

		const existingUser = await db.query.users.findFirst({
			columns: { id: true, username: true, role: true, displayName: true },
			where: { id: input.id },
		});
		if (!existingUser) {
			log.error({ userId: input.id }, "user not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Akun tidak ditemukan.",
			});
		}

		log.info(
			{ userId: input.id, username: input.username },
			"attempting to update user account",
		);

		try {
			const [updated] = await db
				.update(users)
				.set({
					username: input.username,
					displayName: input.display_name,
					passwordHash: input.password
						? await hashPassword(input.password)
						: undefined,
					role: input.role,
				})
				.where(eq(users.id, input.id))
				.returning({ id: users.id });

			await context.locals.logAudit(
				"UPDATE",
				"users",
				updated.id,
				auditDetail.update(
					`Mengubah akun user: ${input.username} dengan role: ${input.role}`,
					existingUser,
					toCamelCaseKeys(omit(input, ["password"])),
				),
			);

			log.info("user account updated successfully");
			return updated;
		} catch (error) {
			log.error({ error, userId: input.id }, "failed to update user account");
			throw error;
		}
	},
});

export const _delete = defineAction({
	accept: "form",
	input: z.object({ id: z.coerce.number() }),
	handler: async ({ id }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:accounts:delete",
		});
		const target = await db.query.users.findFirst({
			columns: { id: true, username: true, displayName: true, role: true },
			where: { id },
		});
		if (!target) {
			log.error({ userId: id }, "user not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Akun tidak ditemukan.",
			});
		}

		log.info(
			{ userId: id, username: target.username },
			"attempting to delete user account",
		);

		try {
			const [deleted] = await db
				.delete(users)
				.where(eq(users.id, id))
				.returning({ id: users.id });

			await context.locals.logAudit(
				"DELETE",
				"users",
				deleted.id,
				auditDetail.delete(
					`Menghapus akun user: ${target.username} (${target.role})`,
					target,
				),
			);

			log.info("user account deleted successfully");
			return deleted;
		} catch (error) {
			log.error({ error, userId: id }, "failed to delete user account");
			throw error;
		}
	},
});
