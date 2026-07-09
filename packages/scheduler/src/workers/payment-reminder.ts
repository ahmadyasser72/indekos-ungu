import { db } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	notifications,
	type User,
} from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import { logger } from "../logger";

export const runPaymentReminder = async (systemUser: User, now?: Date) => {
	const ref = now ?? new Date();

	const dueInvoices = await db.query.invoices.findMany({
		columns: { id: true },
		where: {
			status: "unpaid",
			dueDate: {
				gte: ref,
				// remind tenants 3 days before due
				lte: dayjs(ref).add(3, "days").endOf("day").toDate(),
			},
			NOT: {
				// Only queue a reminder if no pending/sent reminder exists from the last 23 hours
				notifications: {
					type: "reminder",
					status: { NOT: "failed" },
					createdAt: { gte: dayjs(ref).subtract(23, "hours").toDate() },
				},
			},
		},
		with: {
			lease: { columns: { tenantId: true } },
		},
	});

	if (dueInvoices.length === 0) {
		logger.info({ count: 0 }, "Reminders created");
		return;
	}

	const newNotifications = await db
		.insert(notifications)
		.values(
			dueInvoices.map((invoice) => ({
				tenantId: invoice.lease.tenantId,
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
			`Cron membuat ${newNotifications.length} notifikasi pengingat pembayaran`,
			"notifications",
			newNotifications.map(({ id }) => id),
		),
	});

	logger.info({ count: dueInvoices.length }, "Reminders created");
};
