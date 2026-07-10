import { db } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	notifications,
} from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";

import type { SchedulerWorkerFunction } from "./types";

export const runPaymentReminder: SchedulerWorkerFunction = async (
	systemUser,
	referenceDate,
	options,
) => {
	const log = options?.logger?.child({ module: "workers:payment-reminder" });

	const referenceTime = referenceDate ?? new Date();

	log?.info(
		{ referenceExecutionTime: referenceTime.toISOString() },
		"payment-reminder: starting automated evaluation loop for approaching unpaid invoice deadlines",
	);

	try {
		const dueInvoices = await db.query.invoices.findMany({
			columns: { id: true },
			where: {
				status: "unpaid",
				dueDate: {
					gte: referenceTime,
					// remind tenants 3 days before due
					lte: dayjs(referenceTime).add(3, "days").endOf("day").toDate(),
				},
				NOT: {
					// Only queue a reminder if no pending/sent reminder exists from the last 23 hours
					notifications: {
						type: "reminder",
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

		if (dueInvoices.length === 0) {
			log?.info(
				{ createdReminderCount: 0 },
				"payment-reminder: no upcoming unpaid invoices found requiring early warning notifications",
			);
			return {
				success: true,
				processedCount: 0,
				message: "Tidak ada invoice mendatang yang memerlukan pengingat",
			};
		}

		const invoiceIds = dueInvoices.map((invoice) => invoice.id);

		const newNotifications = await db
			.insert(notifications)
			.values(
				dueInvoices.map((invoice) => ({
					tenantId: invoice.lease.tenantId,
					invoiceId: invoice.id,
					type: "reminder" as const,
					status: "pending" as const,
					createdAt: referenceDate,
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

		log?.info(
			{
				createdReminderCount: dueInvoices.length,
				targetInvoiceIds: invoiceIds,
			},
			"payment-reminder: pending warning notifications successfully committed to the outbound message queue",
		);

		return {
			success: true,
			processedCount: newNotifications.length,
			message: `Berhasil membuat ${newNotifications.length} pengingat pembayaran`,
		};
	} catch (error) {
		log?.error(
			{ error },
			"payment-reminder: unhandled exception encountered during notification generation schedule parsing",
		);
		return {
			success: false,
			processedCount: 0,
			message: `Gagal: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`,
		};
	}
};
