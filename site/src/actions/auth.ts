import { db, eq } from "@e-kos/database";
import { auditDetail, users } from "@e-kos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

import { verifyPassword } from "~/lib/auth";

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
				role: user.role as App.SessionData["user"]["role"],
			}),
			db
				.update(users)
				.set({ lastAccessed: new Date() })
				.where(eq(users.id, user.id)),
		]);

		context.locals.user = {
			id: user.id,
			name: user.displayName ?? user.username,
			role: user.role as App.SessionData["user"]["role"],
		};

		await context.locals.logAudit(
			"LOGIN",
			"users",
			user.id,
			auditDetail.generic(`User ${user.username} berhasil login`),
		);
	},
});
