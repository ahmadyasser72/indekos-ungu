import { createHash, randomUUID } from "node:crypto";

import { db, eq } from "./index";
import { USER_ROLES, users } from "./schema";

async function ensureUser(
	username: string,
	displayName: string,
	role: (typeof USER_ROLES)[number],
	passwordOverride?: string,
) {
	const existing = await db.query.users.findFirst({
		where: { username },
	});

	const password = passwordOverride ?? randomUUID();
	const passwordHash = createHash("sha512").update(password).digest("hex");

	if (existing) {
		if (!passwordOverride) {
			console.log(
				"[Seed] User '%s' already exists (id=%d), skipping",
				username,
				existing.id,
			);

			return;
		}

		await db
			.update(users)
			.set({ passwordHash })
			.where(eq(users.id, existing.id));

		console.log(
			"[Seed] User '%s' password updated (id=%d)",
			username,
			existing.id,
		);
	}

	const [user] = await db
		.insert(users)
		.values({ username, passwordHash, displayName, role })
		.returning({ id: users.id });

	console.log("[Seed] User '%s' created (id=%d)", username, user.id);
}

async function main() {
	await ensureUser("system", "System Scheduler", "system");
	await ensureUser("bot-wa", "WhatsApp Bot", "system");
	await ensureUser(
		"admin",
		"Administrator",
		"admin",
		process.env.ADMIN_PASSWORD,
	);
}

main();
