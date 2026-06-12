import { db } from "@e-kos/database";

const cronUser = await db.query.users.findFirst({
	where: { username: "cron" },
});

if (!cronUser) {
	console.error(
		"[Scheduler] Cron user not found. Run `bun run db:seed` first.",
	);
	process.exit(1);
}

// ─── Overdue otomatis tiap jam 00:00 ──────────────
Bun.cron("./src/workers/overdue.ts", "0 0 * * *", "overdue-check");

// ─── Pengingat pembayaran tiap jam 8 pagi ─────────
Bun.cron("./src/workers/rent-reminder.ts", "0 8 * * *", "rent-reminder");

console.log("[Scheduler] Cron jobs registered");
