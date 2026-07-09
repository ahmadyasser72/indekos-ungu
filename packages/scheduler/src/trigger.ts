import { db } from "@indekos/database";
import { createLogger } from "@indekos/utilities/logger";

import { runInvoiceGeneration } from "./workers/invoice-generation";
import { runMonthlyReport } from "./workers/monthly-report";
import { runOverdueCheck } from "./workers/overdue";
import { runOverdueReminder } from "./workers/overdue-reminder";
import { runPaymentReminder } from "./workers/payment-reminder";

const baseLogger = createLogger("scheduler");

const main = async () => {
	const task = process.argv[2];
	const dateString = process.argv[3];

	// Create entry utility execution context logger
	const runtimeLogger = baseLogger.child({ module: "scheduler:cli-trigger" });

	if (!task || !dateString) {
		runtimeLogger.error("usage syntax error: bun trigger <task> <date_string>");
		runtimeLogger.error(
			"available tasks: overdue | overdue-reminder | reminder | invoice | report",
		);
		runtimeLogger.error(
			"expected date format parameter: YYYY-MM-DD (WITA, UTC+8)",
		);
		process.exit(1);
	}

	const date = new Date(`${dateString}T00:00:00+08:00`);

	if (Number.isNaN(date.getTime())) {
		runtimeLogger.error(
			{ providedDateString: dateString },
			"supplied target date string variable is invalid",
		);
		process.exit(1);
	}

	const systemUser = await db.query.users.findFirst({
		where: { username: "system" },
	});

	if (!systemUser) {
		runtimeLogger.error(
			"system user record not found in database, please run seed script first",
		);
		process.exit(1);
	}

	// Spawn execution-scoped child logger passing structural history tracing attributes
	const executionLogger = baseLogger.child({
		module: `scheduler:manual:${task}`,
		isRetroactive: true,
		targetExecutionTime: date.toISOString(),
		triggeredAt: new Date().toISOString(),
	});

	executionLogger.warn(
		{ targetTaskName: task },
		"initiating manual retroactive backfill execution task run",
	);

	try {
		switch (task) {
			case "overdue":
				await runOverdueCheck(systemUser, date, { logger: executionLogger });
				break;
			case "overdue-reminder":
				await runOverdueReminder(systemUser, date, { logger: executionLogger });
				break;
			case "reminder":
				await runPaymentReminder(systemUser, date, { logger: executionLogger });
				break;
			case "invoice":
				await runInvoiceGeneration(systemUser, date, {
					logger: executionLogger,
				});
				break;
			case "report":
				await runMonthlyReport(systemUser, date, { logger: executionLogger });
				break;
			default:
				executionLogger.error(
					{ targetTaskName: task },
					"supplied task override option does not match available command handlers",
				);
				process.exit(1);
		}

		executionLogger.info(
			"manual retroactive backfill execution task run completed successfully",
		);
	} catch (error) {
		executionLogger.error(
			{ error },
			"fatal exception encountered while executing manual retroactive backfill script block",
		);
		process.exit(1);
	}
};

main();
