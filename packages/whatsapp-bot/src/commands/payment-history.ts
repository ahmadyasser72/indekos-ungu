import { db } from "@e-kos/database";
import type { Tenant } from "@e-kos/database/schema";
import { formatDate } from "@e-kos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@e-kos/utilities/transforms";

import { render } from "../template";

export const paymentHistory = async (tenant: Tenant): Promise<string> => {
	const lease = await db.query.leases.findFirst({
		columns: { id: true },
		where: { tenantId: tenant.id, isActive: true },
		with: {
			invoices: {
				where: { status: "paid" },
				limit: 10,
			},
		},
	});

	if (!lease) {
		return "Anda tidak memiliki riwayat pembayaran.";
	} else if (lease.invoices.length === 0) {
		return "Belum ada riwayat pembayaran lunas.";
	}

	return render("payment-history", {
		paid: lease.invoices.map(({ id, amount, dueDate }) => ({
			id: formatInvoiceNumber(id, dueDate),
			amount: formatCurrency(amount),
			dueDate: formatDate(dueDate),
		})),
	});
};
