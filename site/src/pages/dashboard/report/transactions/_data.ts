import { db, INVOICE_STATUS } from "@indekos/database";
import { getPaymentUrlFromReference } from "@indekos/database/duitku";
import { parseDateRange } from "@indekos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@indekos/utilities/transforms";

import { z } from "astro/zod";
import { groupBy, sumBy } from "es-toolkit";

import type { Stat } from "~/components/data/stats.astro";
import { periodFields, querySchema, statusSchema, paginationFields } from "~/lib/query";

export { INVOICE_STATUS };

export const fetchTransactions = async (
	params: z.infer<typeof transactionQuerySchema>,
) => {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const invoices = await db.query.invoices.findMany({
		where: {
			...(params.query && {
				OR: [
					{ lease: { tenant: { fullName: { like: `%${params.query}%` } } } },
					{ lease: { room: { roomNumber: { like: `%${params.query}%` } } } },
				],
			}),

			...(params.status && { status: params.status }),

			dueDate: { gte: startDate, lte: endDate },
		},
		with: {
			lease: {
				with: { tenant: true, room: true },
			},
		},
	});

	return invoices.map(({ lease, ...invoice }) => ({
		...invoice,
		invoiceNumber: formatInvoiceNumber(invoice),
		tenantName: lease.tenant.fullName,
		roomNumber: lease.room.roomNumber,
		paymentUrl: invoice.duitkuReference
			? getPaymentUrlFromReference(invoice.duitkuReference)
			: null,
	}));
};

export const getTransactionStats = (
	transactions: Awaited<ReturnType<typeof fetchTransactions>>,
): Stat[] => {
	const { paid = [], unpaid = [] } = groupBy(transactions, ({ status }) =>
		status === "paid" ? "paid" : "unpaid",
	);
	const totalRevenue = sumBy(paid, ({ amount }) => amount);
	const paidCount = paid?.length;
	const paidRate =
		transactions.length > 0
			? Math.round((paidCount / transactions.length) * 100)
			: 0;
	const unpaidCount = unpaid.length;
	const unpaidTotal = sumBy(unpaid, ({ amount }) => amount);

	return [
		{
			title: "Total Pemasukan",
			value: formatCurrency(totalRevenue),
			desc: `${paidCount} invoice terbayar`,
			icon: "lucide:arrow-up-right" as const,
		},
		{
			title: "Sudah Terbayar",
			value: `${paidCount} Invoice`,
			desc: `${paidRate}% dari total`,
			icon: "lucide:circle-check" as const,
		},
		{
			title: "Pembayaran Tertunggak",
			value: `${unpaidCount} Invoice`,
			desc: formatCurrency(unpaidTotal),
			icon: "lucide:x-circle" as const,
		},
	];
};

export const transactionQuerySchema = z.object({
	query: querySchema,
	...periodFields,
	status: statusSchema(INVOICE_STATUS),
	...paginationFields,
});

export const INVOICE_STATUS_BADGES = {
	unpaid: "badge-warning",
	paid: "badge-success",
	overdue: "badge-error",
} satisfies Record<(typeof INVOICE_STATUS)[number], string>;

export const INVOICE_STATUS_LABELS = {
	unpaid: "Belum Bayar",
	paid: "Lunas",
	overdue: "Terlambat",
} satisfies Record<(typeof INVOICE_STATUS)[number], string>;
