import { createHash, randomUUID } from "node:crypto";

import { db } from "./index";
import { USER_ROLES, users } from "./schema";

async function ensureUser(
	username: string,
	displayName: string,
	role: (typeof USER_ROLES)[number],
) {
	const existing = await db.query.users.findFirst({
		where: { username },
	});

	if (existing) {
		console.log(
			"[Seed] User '%s' already exists (id=%d)",
			username,
			existing.id,
		);
		return existing;
	}

	const password = randomUUID();
	const passwordHash = createHash("sha512").update(password).digest("hex");

	const [user] = await db
		.insert(users)
		.values({ username, passwordHash, displayName, role })
		.returning({ id: users.id });

	console.log(
		"[Seed] User '%s' created (id=%d, password=%s)",
		username,
		user.id,
		password,
	);
	return user;
}

async function main() {
	await ensureUser("system", "System Scheduler", "system");
	await ensureUser("bot-wa", "WhatsApp Bot", "system");
}

main();
