import { db } from "@indekos/database";
import { createLogger } from "@indekos/utilities/logger";

import { runInvoiceGeneration } from "./workers/invoice-generation";
import { runMonthlyReport } from "./workers/monthly-report";
import { runOverdueCheck } from "./workers/overdue";
import { runOverdueReminder } from "./workers/overdue-reminder";
import { runPaymentReminder } from "./workers/payment-reminder";

const baseLogger = createLogger("scheduler");

const main = async () => {
	const log = baseLogger.child({ module: "scheduler:daemon" });

	try {
		const systemUser = await db.query.users.findFirst({
			where: { username: "system" },
		});

		if (!systemUser) {
			log.error(
				"system user record not found in database, please run seed script first",
			);
			process.exit(1);
		}

		// Overdue otomatis tiap jam 00:00 WITA
		// Callback-based Bun.cron pakai UTC, jadi 16:00 UTC = 00:00 WITA (+1 day)
		Bun.cron("0 16 * * *", async () => {
			const cronLogger = baseLogger.child({
				module: "scheduler:cron:overdue",
				isRetroactive: false,
				targetExecutionTime: new Date().toISOString(),
			});

			cronLogger.info(
				"automated cron trigger: starting overdue tasks execution block",
			);
			try {
				await runOverdueCheck(systemUser, undefined, { logger: cronLogger });
				await runOverdueReminder(systemUser, undefined, { logger: cronLogger });
				cronLogger.info(
					"automated cron trigger: completed overdue tasks execution block successfully",
				);
			} catch (error) {
				cronLogger.error(
					{ error },
					"automated cron trigger: exception encountered during overdue tasks execution",
				);
			}
		});

		// Pembuatan invoice bulanan dan pengingat pembayaran tiap jam 8 pagi WITA
		// 00:00 UTC = 08:00 WITA
		Bun.cron("0 0 * * *", async () => {
			const cronLogger = baseLogger.child({
				module: "scheduler:cron:billing",
				isRetroactive: false,
				targetExecutionTime: new Date().toISOString(),
			});

			cronLogger.info(
				"automated cron trigger: starting monthly billing generation tasks",
			);
			try {
				await Promise.all([
					runInvoiceGeneration(systemUser, undefined, { logger: cronLogger }),
					runPaymentReminder(systemUser, undefined, { logger: cronLogger }),
				]);
				cronLogger.info(
					"automated cron trigger: completed monthly billing generation tasks successfully",
				);
			} catch (error) {
				cronLogger.error(
					{ error },
					"automated cron trigger: exception encountered during billing generation tasks",
				);
			}
		});

		// Laporan keuangan bulanan tiap tanggal 1 jam 8 pagi WITA
		// 00:00 UTC = 08:00 WITA
		Bun.cron("0 0 1 * *", async () => {
			const cronLogger = baseLogger.child({
				module: "scheduler:cron:report",
				isRetroactive: false,
				targetExecutionTime: new Date().toISOString(),
			});

			cronLogger.info(
				"automated cron trigger: starting monthly financial statement compilation",
			);
			try {
				await runMonthlyReport(systemUser, undefined, { logger: cronLogger });
				cronLogger.info(
					"automated cron trigger: completed monthly financial statement compilation successfully",
				);
			} catch (error) {
				cronLogger.error(
					{ error },
					"automated cron trigger: exception encountered during report generation tasks",
				);
			}
		});

		log.info(
			"scheduler daemon initialized and automated cron triggers registered successfully",
		);
	} catch (error) {
		log.error(
			{ error },
			"scheduler daemon failed during core initialization startup loop",
		);
		process.exit(1);
	}
};

main();
