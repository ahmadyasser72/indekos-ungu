import { db } from "@indekos/database";
import { getPaymentUrlFromReference } from "@indekos/database/duitku";
import type { Tenant } from "@indekos/database/schema";
import { formatDate } from "@indekos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@indekos/utilities/transforms";

import { sumBy } from "es-toolkit";
import type { Logger } from "pino";

import { render } from "~/template";

export const checkBills = async (
	tenant: Tenant,
	options?: { logger?: Logger },
): Promise<string> => {
	const log = options?.logger?.child({ submodule: "commands:check-bills" });

	log?.debug(
		{ tenantId: tenant.id },
		"retrieving active lease and unpaid invoices",
	);

	try {
		const lease = await db.query.leases.findFirst({
			where: { tenantId: tenant.id, isActive: true },
			with: {
				room: true,
				invoices: {
					where: { status: "unpaid" },
				},
			},
		});

		if (!lease?.room) {
			log?.info({ tenantId: tenant.id }, "no active lease found");
			return "📍 Anda tidak memiliki kontrak sewa yang aktif.";
		}

		const total = sumBy(lease.invoices, ({ amount }) => amount);
		const unpaid = lease.invoices.map(
			({ id, amount, dueDate, createdAt, duitkuReference }) => ({
				id: formatInvoiceNumber({ id, dueDate }),
				amount: formatCurrency(amount),
				dueDate: formatDate(dueDate),
				createdAt: formatDate(createdAt),
				paymentUrl: duitkuReference
					? getPaymentUrlFromReference(duitkuReference)
					: null,
			}),
		);

		log?.info(
			{
				tenantId: tenant.id,
				leaseId: lease.id,
				unpaidCount: unpaid.length,
				totalAmount: total,
			},
			"unpaid bills retrieved successfully",
		);

		return render("check-bills", {
			roomNumber: lease.room.roomNumber,
			roomType: lease.room.roomType,
			monthlyPrice: formatCurrency(lease.room.monthlyPrice),
			unpaid,
			total: formatCurrency(total),
			hasPaymentLink: unpaid.some(({ paymentUrl }) => paymentUrl),
		});
	} catch (error) {
		log?.error({ error, tenantId: tenant.id }, "failed to retrieve bills");
		throw error;
	}
};
