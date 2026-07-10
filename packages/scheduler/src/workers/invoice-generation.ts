import { db } from "@indekos/database";
import { generatePaymentLink } from "@indekos/database/duitku/invoice-payment";
import { auditDetail, auditLogs, invoices } from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import type { SchedulerWorkerFunction } from "./types";

export const runInvoiceGeneration: SchedulerWorkerFunction = async (
	systemUser,
	referenceDate,
	options,
) => {
	const log = options?.logger?.child({ module: "workers:invoice-generation" });

	const referenceTime = referenceDate ?? new Date();

	log?.info(
		{ referenceExecutionTime: referenceTime.toISOString() },
		"invoice-generation: starting automated lease invoice validation loop",
	);

	try {
		const activeLeases = await db.query.leases.findMany({
			where: { isActive: true },
			with: { room: true, invoices: true },
		});

		const toCreate: { leaseId: number; amount: number; dueDate: Date }[] = [];

		for (const lease of activeLeases) {
			const endDate = lease.endDate ? dayjs(lease.endDate) : null;
			let cycleStart = dayjs(lease.startDate).add(1, "month");

			while (true) {
				// Stop if cycle start is past lease end
				if (endDate && !cycleStart.isBefore(endDate, "day")) break;

				const creationDate = cycleStart.subtract(7, "days");

				// Don't create invoices too far in the future
				if (creationDate.isAfter(dayjs(referenceTime), "day")) break;

				// Avoid duplicate invoices for the same period
				const existing = lease.invoices.find(({ dueDate }) =>
					cycleStart.isSame(dueDate, "days"),
				);

				if (!existing) {
					toCreate.push({
						leaseId: lease.id,
						amount: lease.room.monthlyPrice,
						dueDate: cycleStart.toDate(),
					});
				}

				cycleStart = cycleStart.add(1, "month");
			}
		}

		let newInvoices: { id: number }[] = [];

		if (toCreate.length > 0) {
			newInvoices = await db
				.insert(invoices)
				.values(toCreate)
				.returning({ id: invoices.id });

			log?.info(
				{ invoiceCount: newInvoices.length },
				"invoice-generation: persistent database records committed successfully",
			);

			await db.insert(auditLogs).values({
				userId: systemUser.id,
				action: "CREATE",
				tableName: "invoices",
				details: auditDetail.cron(
					`Cron membuat ${newInvoices.length} invoice(s)`,
					"invoices",
					newInvoices.map(({ id }) => id),
				),
			});
		}

		// Generate payment links for newly created invoices
		if (newInvoices.length > 0) {
			let generatedCount = 0;

			for (const { id } of newInvoices) {
				try {
					await generatePaymentLink(id, systemUser.id, { logger: log });
					generatedCount++;
				} catch (error) {
					log?.error(
						{ invoiceId: id, error },
						"invoice-generation: failed to generate transaction payment gateway link",
					);
				}
			}

			log?.info(
				{ generatedCount, totalInvoices: newInvoices.length },
				"invoice-generation: payment links compilation sequence complete",
			);
		}

		log?.info(
			{ createdInvoiceCount: toCreate.length },
			"invoice-generation: execution routine completed successfully",
		);

		return {
			success: true,
			processedCount: toCreate.length,
			message: `Berhasil membuat ${toCreate.length} invoice dengan ${newInvoices.length} link pembayaran`,
		};
	} catch (error) {
		log?.error(
			{ error },
			"invoice-generation: unhandled exception encountered during generation batch pipeline",
		);
		return {
			success: false,
			processedCount: 0,
			message: `Gagal: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`,
		};
	}
};
