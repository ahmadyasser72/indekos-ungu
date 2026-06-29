import { db } from "@e-kos/database";
import { generatePaymentLink } from "@e-kos/database/duitku/invoice-payment";
import {
	auditDetail,
	auditLogs,
	invoices,
	type User,
} from "@e-kos/database/schema";
import dayjs from "@e-kos/utilities/date";

import { logger } from "../index";

export const runInvoiceGeneration = async (systemUser: User, now?: Date) => {
	const ref = now ?? new Date();

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
			if (creationDate.isAfter(dayjs(ref), "day")) break;

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

		await db.insert(auditLogs).values({
			userId: systemUser.id,
			action: "CREATE",
			tableName: "invoices",
			details: auditDetail.cron(
				`Cron created ${newInvoices.length} invoice(s)`,
				"invoices",
				newInvoices.map(({ id }) => id),
			),
		});
	}

	// Generate payment links for newly created invoices
	const siteUrl = process.env.SITE_URL;
	if (newInvoices.length > 0 && siteUrl) {
		let generated = 0;
		for (const { id } of newInvoices) {
			try {
				await generatePaymentLink(id, siteUrl, systemUser.id);
				generated++;
			} catch (err) {
				logger.error({ invoiceId: id, err }, "Failed to generate payment link");
			}
		}
		logger.info(
			{ generated, total: newInvoices.length },
			"Payment links generated",
		);
	}

	logger.info({ count: toCreate.length }, "Invoices generated");
};
