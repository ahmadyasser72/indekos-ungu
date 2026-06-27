import { db, eq } from "@e-kos/database";
import { auditDetail, users } from "@e-kos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { omit } from "es-toolkit";
import { toCamelCaseKeys } from "es-toolkit/object";

import { hashPassword, ROLES } from "~/lib/auth";

export const add = defineAction({
	accept: "form",
	input: z.object({
		username: z.string(),
		display_name: z.string(),
		password: z.string(),
		role: z.enum(ROLES),
	}),
	handler: async (input, context) => {
		const sameUsername = await db.query.users.findFirst({
			columns: { id: true },
			where: { username: input.username },
		});
		if (sameUsername?.id) {
			console.error("accounts.add: username already taken", {
				username: input.username,
			});
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Username tidak tersedia.",
			});
		}

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

		return inserted;
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
		const sameUsername = await db.query.users.findFirst({
			columns: { id: true },
			where: { username: input.username, id: { ne: input.id } },
		});
		if (sameUsername?.id) {
			console.error("accounts.edit: username already taken", {
				username: input.username,
			});
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
			console.error("accounts.edit: user not found", { id: input.id });
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Akun tidak ditemukan.",
			});
		}

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

		return updated;
	},
});

export const _delete = defineAction({
	accept: "form",
	input: z.object({ id: z.coerce.number() }),
	handler: async ({ id }, context) => {
		const target = await db.query.users.findFirst({
			columns: { id: true, username: true, displayName: true, role: true },
			where: { id },
		});
		if (!target) {
			console.error("accounts.delete: user not found", { id });
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Akun tidak ditemukan.",
			});
		}

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

		return deleted;
	},
});
