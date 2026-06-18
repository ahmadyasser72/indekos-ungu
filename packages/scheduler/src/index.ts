import { db } from "@e-kos/database";

import { runOverdueCheck } from "./workers/overdue";
import { runRentReminder } from "./workers/rent-reminder";

export async function main() {
	const systemUser = await db.query.users.findFirst({
		where: { username: "system" },
	});

	if (!systemUser) {
		console.error(
			"[Scheduler] System user not found. Run `bun run db:seed` first.",
		);
		process.exit(1);
	}

	// ─── Overdue otomatis tiap jam 00:00 WITA ──────────
	// Callback-based Bun.cron pakai UTC, jadi 16:00 UTC = 00:00 WITA (+1 day)
	Bun.cron("0 16 * * *", () => runOverdueCheck(systemUser));

	// ─── Pengingat pembayaran tiap jam 8 pagi WITA ─────
	// 00:00 UTC = 08:00 WITA
	Bun.cron("0 0 * * *", () => runRentReminder(systemUser));

	console.log("[Scheduler] Cron jobs registered");
}
