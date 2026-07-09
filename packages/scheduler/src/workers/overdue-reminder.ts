import { db } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	notifications,
	type User,
} from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import { logger } from "../logger";

export const runOverdueReminder = async (systemUser: User, now?: Date) => {
	const ref = now ?? new Date();

	const overdueInvoices = await db.query.invoices.findMany({
		columns: { id: true },
		where: {
			status: "overdue",
			dueDate: { lte: ref },
			NOT: {
				// Only queue a reminder if no pending/sent reminder exists from the last 23 hours
				notifications: {
					type: "overdue_reminder",
					status: { NOT: "failed" },
					createdAt: { gte: dayjs(ref).subtract(23, "hours").toDate() },
				},
			},
		},
		with: {
			lease: { columns: { tenantId: true } },
		},
	});

	if (overdueInvoices.length === 0) {
		logger.info({ count: 0 }, "Overdue reminders created");
		return;
	}

	const newNotifications = await db
		.insert(notifications)
		.values(
			overdueInvoices.map((invoice) => ({
				tenantId: invoice.lease.tenantId,
				invoiceId: invoice.id,
				type: "overdue_reminder" as const,
				status: "pending" as const,
			})),
		)
		.returning({ id: notifications.id });

	await db.insert(auditLogs).values({
		userId: systemUser.id,
		action: "CREATE",
		tableName: "notifications",
		details: auditDetail.cron(
			`Cron membuat ${newNotifications.length} notifikasi pengingat invoice jatuh tempo`,
			"notifications",
			newNotifications.map(({ id }) => id),
		),
	});

	logger.info({ count: overdueInvoices.length }, "Overdue reminders created");
};
