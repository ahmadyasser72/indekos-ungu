import { db } from "@e-kos/database";
import {
	auditDetail,
	auditLogs,
	notifications,
	type User,
} from "@e-kos/database/schema";
import dayjs from "@e-kos/utilities/date";

import { logger } from "../index";

export const runRentReminder = async (systemUser: User, now?: Date) => {
	const ref = now ?? new Date();
	const threeDaysLater = dayjs(ref).add(3, "days").toDate();

	const dueInvoices = await db.query.invoices.findMany({
		where: {
			status: "unpaid",
			dueDate: { gte: ref, lte: threeDaysLater },
		},
		with: {
			lease: { with: { tenant: true } },
		},
	});

	if (dueInvoices.length > 0) {
		const newNotifications = await db
			.insert(notifications)
			.values(
				dueInvoices.map((invoice) => ({
					tenantId: invoice.lease.tenant.id,
					invoiceId: invoice.id,
					type: "reminder" as const,
					status: "pending" as const,
				})),
			)
			.returning({ id: notifications.id });

		await db.insert(auditLogs).values({
			userId: systemUser.id,
			action: "CREATE",
			tableName: "notifications",
			details: auditDetail.cron(
				`Cron created ${newNotifications.length} payment reminder notification(s)`,
				"notifications",
				newNotifications.map(({ id }) => id),
			),
		});
	}

	logger.info({ count: dueInvoices.length }, "Reminders created");
};
