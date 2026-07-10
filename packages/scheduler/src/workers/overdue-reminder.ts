import { db } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	notifications,
} from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import type { SchedulerWorkerFunction } from "./types";

export const runOverdueReminder: SchedulerWorkerFunction = async (
	systemUser,
	referenceDate,
	options,
) => {
	const log = options?.logger?.child({ module: "workers:overdue-reminder" });

	const referenceTime = referenceDate ?? new Date();

	log?.info(
		{ referenceExecutionTime: referenceTime.toISOString() },
		"overdue-reminder: starting automated evaluation loop for outstanding overdue notifications",
	);

	try {
		const overdueInvoices = await db.query.invoices.findMany({
			columns: { id: true },
			where: {
				status: "overdue",
				dueDate: { lte: referenceTime },
				NOT: {
					// Only queue a reminder if no pending/sent reminder exists from the last 23 hours
					notifications: {
						type: "overdue_reminder",
						status: { NOT: "failed" },
						createdAt: {
							gte: dayjs(referenceTime).subtract(23, "hours").toDate(),
						},
					},
				},
			},
			with: {
				lease: { columns: { tenantId: true } },
			},
		});

		if (overdueInvoices.length === 0) {
			log?.info(
				{ createdReminderCount: 0 },
				"overdue-reminder: no eligible past-due invoices found requiring notification dispatch",
			);
			return {
				success: true,
				processedCount: 0,
				message: "Tidak ada invoice jatuh tempo yang memerlukan pengingat",
			};
		}

		const invoiceIds = overdueInvoices.map((invoice) => invoice.id);

		const newNotifications = await db
			.insert(notifications)
			.values(
				overdueInvoices.map((invoice) => ({
					tenantId: invoice.lease.tenantId,
					invoiceId: invoice.id,
					type: "overdue_reminder" as const,
					status: "pending" as const,
					createdAt: referenceTime,
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

		log?.info(
			{
				createdReminderCount: overdueInvoices.length,
				targetInvoiceIds: invoiceIds,
			},
			"overdue-reminder: reminder notifications successfully inserted into the database queue",
		);

		return {
			success: true,
			processedCount: newNotifications.length,
			message: `Berhasil membuat ${newNotifications.length} pengingat invoice jatuh tempo`,
		};
	} catch (error) {
		log?.error(
			{ error },
			"overdue-reminder: unhandled exception encountered during reminder calculation and generation process",
		);
		return {
			success: false,
			processedCount: 0,
			message: `Gagal: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`,
		};
	}
};
