import { db } from "@indekos/database";
import { auditDetail, auditLogs } from "@indekos/database/schema";
import dayjs, { formatDate } from "@indekos/utilities/date";
import { sendPush } from "@indekos/utilities/push";
import { formatCurrency } from "@indekos/utilities/transforms";

import { groupBy, sumBy } from "es-toolkit";

import type { SchedulerWorkerFunction } from "./types";

export const runMonthlyReport: SchedulerWorkerFunction = async (
	systemUser,
	referenceDate,
	options,
) => {
	// Spawn a contextual child logger specifically for this background compilation execution block
	const log = options?.logger?.child({ module: "workers:monthly-report" });

	const referenceTime = referenceDate ?? new Date();
	const startDate = dayjs(referenceTime)
		.subtract(1, "month")
		.startOf("month")
		.toDate();
	const endDate = dayjs(referenceTime)
		.subtract(1, "month")
		.endOf("month")
		.toDate();

	log?.info(
		{
			reportStartDate: startDate.toISOString(),
			reportEndDate: endDate.toISOString(),
		},
		"monthly-report: starting monthly statement generation and compilation cycle",
	);

	try {
		const invoices = await db.query.invoices.findMany({
			where: { dueDate: { gte: startDate, lte: endDate } },
		});

		const { paid = [], unpaid = [] } = groupBy(invoices, ({ status }) =>
			status === "paid" ? "paid" : "unpaid",
		);

		const paidTotal = sumBy(paid, ({ amount }) => amount);
		const unpaidTotal = sumBy(unpaid, ({ amount }) => amount);

		const users = await db.query.users.findMany({
			where: { role: { in: ["staff", "owner"] } },
		});

		if (users.length === 0) {
			log?.warn(
				"monthly-report: no staff or owner administrative user accounts found to receive push notifications",
			);
		}

		await sendPush(
			users,
			{
				title: `Laporan Keuangan ${formatDate(startDate, "MMMM YYYY")}`,
				body: `Terbayar: ${formatCurrency(paidTotal)} | Tertunggak: ${formatCurrency(unpaidTotal)}`,
				url: "/dashboard/report/transactions",
			},
			{ logger: log },
		);

		await db.insert(auditLogs).values({
			userId: systemUser.id,
			action: "CREATE",
			tableName: "push_history",
			details: auditDetail.notification(
				`Laporan bulanan: ${paid.length} terbayar, ${unpaid.length} tertunggak`,
				"push",
				users.map(({ id }) => id),
			),
		});

		log?.info(
			{
				targetMonth: formatDate(startDate, "YYYY-MM"),
				paidCount: paid.length,
				unpaidCount: unpaid.length,
				totalAdministrativeUsersNotified: users.length,
			},
			"monthly-report: push notification statement summary sent successfully",
		);
	} catch (error) {
		log?.error(
			{ error },
			"monthly-report: unhandled exception encountered during monthly statement broadcast compilation",
		);
		throw error;
	}
};
