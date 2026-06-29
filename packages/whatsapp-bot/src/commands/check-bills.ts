import { db } from "@e-kos/database";
import { getPaymentUrlFromReference } from "@e-kos/database/duitku";
import type { Tenant } from "@e-kos/database/schema";
import { formatDate } from "@e-kos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@e-kos/utilities/transforms";

import { sumBy } from "es-toolkit";

import { render } from "../template";

export const checkBills = async (tenant: Tenant): Promise<string> => {
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
		return "📍 Anda tidak memiliki kontrak sewa yang aktif.";
	}

	const total = sumBy(lease.invoices, ({ amount }) => amount);
	const unpaid = lease.invoices.map(
		({ id, amount, dueDate, createdAt, duitkuReference }) => ({
			id: formatInvoiceNumber(id, dueDate),
			amount: formatCurrency(amount),
			dueDate: formatDate(dueDate),
			createdAt: formatDate(createdAt),
			paymentUrl: duitkuReference
				? getPaymentUrlFromReference(duitkuReference)
				: null,
		}),
	);

	return render("check-bills", {
		roomNumber: lease.room.roomNumber,
		roomType: lease.room.roomType,
		monthlyPrice: formatCurrency(lease.room.monthlyPrice),
		unpaid,
		total: formatCurrency(total),
		hasPaymentLink: unpaid.some(({ paymentUrl }) => paymentUrl),
	});
};
