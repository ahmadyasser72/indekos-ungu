import { db, eq } from "@indekos/database";
import { auditDetail, users } from "@indekos/database/schema";
import { hashPassword, verifyPassword } from "@indekos/utilities/password";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { omit, toCamelCaseKeys } from "es-toolkit";

export const updateProfile = defineAction({
	accept: "form",
	input: z.object({
		display_name: z.string(),
		username: z.string(),
		password: z.string().optional(),
	}),
	handler: async (input, context) => {
		const sessionUser = await context.session?.get("user");
		if (!sessionUser) {
			console.error("auth.updateProfile: invalid session", {
				username: input.username,
			});
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Sesi tidak valid.",
			});
		}

		const sameUsername = await db.query.users.findFirst({
			columns: { id: true },
			where: { username: input.username, id: { ne: sessionUser.id } },
		});
		if (sameUsername?.id) {
			console.error("auth.updateProfile: username already taken", {
				username: input.username,
			});
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Username tidak tersedia.",
			});
		}

		const existingUser = await db.query.users.findFirst({
			columns: { username: true, displayName: true },
			where: { id: sessionUser.id },
		});
		if (!existingUser) {
			console.error("auth.updateProfile: user not found", {
				id: sessionUser.id,
			});
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
			})
			.where(eq(users.id, sessionUser.id))
			.returning({
				id: users.id,
				username: users.username,
				displayName: users.displayName,
			});

		const name = updated.displayName ?? updated.username;
		context.session?.set("user", { ...sessionUser, name });
		context.locals.user = { ...sessionUser, name };

		const username =
			input.username === existingUser.username
				? input.username
				: `${existingUser.username}/${input.username}`;
		await context.locals.logAudit(
			"UPDATE",
			"users",
			updated.id,
			auditDetail.update(
				`User ${username} mengupdate profil sendiri`,
				existingUser,
				toCamelCaseKeys(omit(input, ["password"])),
			),
		);

		return updated;
	},
});

export const logout = defineAction({
	accept: "form",
	input: z.object({}),
	handler: async (_, context) => {
		context.session?.destroy();
	},
});

export const login = defineAction({
	accept: "form",
	input: z.object({ username: z.string(), password: z.string() }),
	handler: async (input, context) => {
		const user = await db.query.users.findFirst({
			where: { username: input.username },
		});

		if (!user || !(await verifyPassword(input.password, user.passwordHash)))
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Username atau password tidak sesuai.",
			});

		await Promise.all([
			context.session?.set("user", {
				id: user.id,
				name: user.displayName ?? user.username,
				role: user.role,
			}),
			db
				.update(users)
				.set({ lastAccessed: new Date() })
				.where(eq(users.id, user.id)),
		]);

		context.locals.user = {
			id: user.id,
			name: user.displayName ?? user.username,
			role: user.role,
		};

		await context.locals.logAudit(
			"LOGIN",
			"users",
			user.id,
			auditDetail.generic(`User ${user.username} berhasil login`),
		);
	},
});
