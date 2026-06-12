import { createHash, randomUUID } from "node:crypto";
import { db } from "@e-kos/database";
import { users } from "@e-kos/database/schema";

const CRON_USERNAME = "cron";
const CRON_PASSWORD = randomUUID();

async function main() {
	const existing = await db.query.users.findFirst({
		where: { username: CRON_USERNAME },
	});

	if (existing) {
		console.log("[Seed] Cron user already exists (id=%d)", existing.id);
		return;
	}

	const passwordHash = createHash("sha512").update(CRON_PASSWORD).digest("hex");

	const [cronUser] = await db
		.insert(users)
		.values({
			username: CRON_USERNAME,
			passwordHash,
			displayName: "Cron Scheduler",
			role: "cron",
		})
		.returning({ id: users.id });

	console.log(
		"[Seed] Cron user created (id=%d, password=%s)",
		cronUser.id,
		CRON_PASSWORD,
	);
	console.log("[Seed] Save this password for reference: %s", CRON_PASSWORD);
}

main();
