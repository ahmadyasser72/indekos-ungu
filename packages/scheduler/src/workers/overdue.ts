import { db, inArray } from "@indekos/database";
import { auditDetail, auditLogs, invoices } from "@indekos/database/schema";

import type { SchedulerWorkerFunction } from "./types";

export const runOverdueCheck: SchedulerWorkerFunction = async (
	systemUser,
	referenceDate,
	options,
) => {
	// Spawn a contextual child logger specifically for this background status verification block
	const log = options?.logger?.child({ module: "workers:overdue" });

	const referenceTime = referenceDate ?? new Date();

	log?.info(
		{ referenceExecutionTime: referenceTime.toISOString() },
		"overdue: starting automated scan for outstanding unpaid invoices past due date",
	);

	try {
		const overdueInvoices = await db.query.invoices.findMany({
			where: { status: "unpaid", dueDate: { lte: referenceTime } },
		});

		if (overdueInvoices.length > 0) {
			const invoiceIds = overdueInvoices.map(({ id }) => id);

			await db
				.update(invoices)
				.set({ status: "overdue" })
				.where(inArray(invoices.id, invoiceIds));

			await db.insert(auditLogs).values({
				userId: systemUser.id,
				action: "UPDATE",
				tableName: "invoices",
				details: auditDetail.cron(
					`Cron menandai ${overdueInvoices.length} invoice sebagai jatuh tempo`,
					"invoices",
					invoiceIds,
				),
			});

			log?.info(
				{ overdueInvoiceCount: overdueInvoices.length, invoiceIds },
				"overdue: persistent database records updated to overdue status successfully",
			);
		} else {
			log?.info(
				"overdue: no unpaid invoices found matching the overdue status conditions",
			);
		}

		log?.info(
			{ processedInvoiceCount: overdueInvoices.length },
			"overdue: status check execution routine completed successfully",
		);
	} catch (error) {
		log?.error(
			{ error },
			"overdue: unhandled exception encountered during invoice aging execution loop",
		);
		throw error;
	}
};
