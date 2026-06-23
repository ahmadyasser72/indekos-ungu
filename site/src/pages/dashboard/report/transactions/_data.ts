import { db, INVOICE_STATUS } from "@e-kos/database";
import { getPaymentUrlFromReference } from "@e-kos/database/duitku";

import { z } from "astro/zod";
import { sumBy } from "es-toolkit";

import { parseDateRange } from "~/lib/date";
import { periodFields, querySchema } from "~/lib/query";
import { formatInvoiceNumber } from "~/lib/transforms";

export const transactionQuerySchema = z.object({
	query: querySchema,
	...periodFields,
	status: z
		.enum(["all", ...INVOICE_STATUS])
		.optional()
		.catch(undefined),
});

export type TransactionRow = {
	id: number;
	invoiceNumber: string;
	tenantName: string;
	roomNumber: string;
	amount: number;
	dueDate: Date;
	status: string;
	gatewayRef: string;
	duitkuReference: string | null;
	paymentUrl: string | null;
};

function buildTransactionWhere(
	params: z.infer<typeof transactionQuerySchema>,
	extra?: { useQuery?: boolean },
): Record<string, unknown> {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const where: Record<string, unknown> = {
		dueDate: { gte: startDate, lte: endDate },
	};

	if (extra?.useQuery && params.query) {
		where.OR = [
			{ lease: { tenant: { fullName: { like: `%${params.query}%` } } } },
			{ lease: { room: { roomNumber: { like: `%${params.query}%` } } } },
		];
	}
	if (params.status && params.status !== "all") {
		where.status = params.status;
	}

	return where;
}

function buildCarryoverWhere(
	startDate: Date,
	params: z.infer<typeof transactionQuerySchema>,
	extra?: { useQuery?: boolean },
): Record<string, unknown> {
	const where: Record<string, unknown> = {
		dueDate: { lt: startDate },
	};

	// Only unpaid/overdue invoices from before the period
	if (params.status && params.status !== "all") {
		where.status = params.status;
	} else {
		where.status = { ne: "paid" };
	}

	if (extra?.useQuery && params.query) {
		where.OR = [
			{ lease: { tenant: { fullName: { like: `%${params.query}%` } } } },
			{ lease: { room: { roomNumber: { like: `%${params.query}%` } } } },
		];
	}

	return where;
}

function getPaymentUrl(reference: string | null): string | null {
	if (!reference) return null;
	return getPaymentUrlFromReference(reference);
}

function mapInvoice(inv: {
	id: number;
	amount: number;
	dueDate: Date;
	status: string;
	duitkuReference: string | null;
	lease: {
		tenant: { fullName: string } | null;
		room: { roomNumber: string } | null;
	} | null;
}): TransactionRow {
	return {
		id: inv.id,
		invoiceNumber: formatInvoiceNumber(inv.id),
		tenantName: inv.lease?.tenant?.fullName ?? "-",
		roomNumber: inv.lease?.room?.roomNumber ?? "-",
		amount: inv.amount,
		dueDate: inv.dueDate,
		status: inv.status,
		gatewayRef: inv.duitkuReference ?? "-",
		duitkuReference: inv.duitkuReference,
		paymentUrl: getPaymentUrl(inv.duitkuReference),
	};
}

export async function fetchTransactions(
	params: z.infer<typeof transactionQuerySchema>,
	extra?: { useQuery?: boolean },
): Promise<TransactionRow[]> {
	const { startDate } = parseDateRange(params.from, params.to);

	// Main query: invoices within the period
	const where = buildTransactionWhere(params, extra);

	const invoices = await db.query.invoices.findMany({
		where,
		with: {
			lease: {
				with: { tenant: true, room: true },
			},
		},
	});

	// Carry-over: unpaid/overdue invoices from before the period
	if (startDate && params.status !== "paid") {
		const carryoverWhere = buildCarryoverWhere(startDate, params, extra);

		const carryover = await db.query.invoices.findMany({
			where: carryoverWhere,
			with: {
				lease: {
					with: { tenant: true, room: true },
				},
			},
		});

		// Merge, deduplicate by id (safety — date ranges are disjoint)
		const seen = new Set(invoices.map((i) => i.id));
		for (const inv of carryover) {
			if (!seen.has(inv.id)) {
				invoices.push(inv);
				seen.add(inv.id);
			}
		}
	}

	return invoices.map(mapInvoice);
}

export function getTransactionStats(transactions: TransactionRow[]) {
	const paid = transactions.filter((t) => t.status === "paid");
	const unpaid = transactions.filter((t) => t.status !== "paid");

	return {
		totalRevenue: sumBy(paid, (t) => t.amount),
		paidCount: paid.length,
		unpaidCount: unpaid.length,
		outstandingAmount: sumBy(unpaid, (t) => t.amount),
	};
}
