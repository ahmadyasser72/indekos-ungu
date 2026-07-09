import { and, db, eq } from "@indekos/database";
import {
	auditDetail,
	pushSubscriptions,
	users,
} from "@indekos/database/schema";
import { hashPassword, verifyPassword } from "@indekos/utilities/password";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { omit, pick, toCamelCaseKeys } from "es-toolkit";

export const updateProfile = defineAction({
	accept: "form",
	input: z.object({
		display_name: z.string(),
		username: z.string(),
		password: z.string().optional(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:auth:updateProfile",
		});
		const sessionUser = await context.session?.get("user");
		if (!sessionUser) {
			log.error({ username: input.username }, "invalid session");
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
			log.error({ username: input.username }, "username already taken");
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
			log.error({ userId: sessionUser.id }, "user not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Akun tidak ditemukan.",
			});
		}

		log.info(
			{ userId: sessionUser.id, username: input.username },
			"attempting to update profile",
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

			log.info("profile updated successfully");
			return updated;
		} catch (error) {
			log.error({ error, userId: sessionUser.id }, "failed to update profile");
			throw new ActionError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Gagal memperbarui profil.",
			});
		}
	},
});

export const logout = defineAction({
	accept: "form",
	input: z.object({}),
	handler: async (_, context) => {
		const log = context.locals.logger.child({ module: "actions:auth:logout" });
		const user = await context.session?.get("user");
		const endpoint = await context.session?.get("pushEndpoint");
		log.info({ userId: user?.id }, "logging out user");

		if (user && endpoint) {
			await db
				.delete(pushSubscriptions)
				.where(
					and(
						eq(pushSubscriptions.endpoint, endpoint),
						eq(pushSubscriptions.userId, user.id),
					),
				);
		}

		context.session?.destroy();
	},
});

export const login = defineAction({
	accept: "form",
	input: z.object({ username: z.string(), password: z.string() }),
	handler: async (input, context) => {
		const log = context.locals.logger.child({ module: "actions:auth:login" });
		const user = await db.query.users.findFirst({
			where: { username: input.username },
		});

		if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
			log.warn(
				{ username: input.username },
				"login failed: invalid credentials",
			);
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Username atau password tidak sesuai.",
			});
		}

		const now = new Date();
		await db
			.update(users)
			.set({ lastAccessed: now })
			.where(eq(users.id, user.id));
		const data: App.Locals["user"] = {
			...pick(user, ["id", "role"]),
			name: user.displayName ?? user.username,
			lastAccessed: now,
		};

		context.session?.set("user", data);
		context.locals.user = data;

		await context.locals.logAudit(
			"LOGIN",
			"users",
			user.id,
			auditDetail.generic(`User ${user.username} berhasil login`),
		);

		log.info(
			{ userId: user.id, username: user.username },
			"user logged in successfully",
		);
	},
});
