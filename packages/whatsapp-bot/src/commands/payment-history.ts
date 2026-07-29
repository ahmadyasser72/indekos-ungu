import { db } from "@indekos/database";
import { formatDate } from "@indekos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@indekos/utilities/transforms";

import { render } from "~/template";
import type { CommandHandlerFunction } from "./types";

export const paymentHistory: CommandHandlerFunction = async (
	tenant,
	options,
) => {
	const log = options?.logger?.child({
		submodule: "commands:payment-history",
	});

	log?.debug({ tenantId: tenant.id }, "retrieving payment history");

	try {
		const allLeases = await db.query.leases.findMany({
			where: { tenantId: tenant.id },
			with: {
				room: true,
				invoices: {
					where: { status: "paid" },
					orderBy: { dueDate: "asc" },
				},
			},
			orderBy: { startDate: "desc" },
		});

		if (allLeases.length === 0) {
			log?.info({ tenantId: tenant.id }, "no leases found");
			return "Anda tidak memiliki riwayat pembayaran.";
		}

		const leaseGroups = allLeases
			.filter((l) => l.invoices.length > 0)
			.map((l) => ({
				roomNumber: l.room.roomNumber,
				startDate: formatDate(l.startDate),
				endDate: l.endDate ? formatDate(l.endDate) : "Berlangsung",
				isActive: l.isActive,
				paid: l.invoices.map(({ id, amount, dueDate }) => ({
					id: formatInvoiceNumber({ id, dueDate }),
					amount: formatCurrency(amount),
					dueDate: formatDate(dueDate),
				})),
			}));

		if (leaseGroups.length === 0) {
			log?.info({ tenantId: tenant.id }, "no paid invoices found");
			return "Belum ada riwayat pembayaran lunas.";
		}

		log?.info(
			{
				tenantId: tenant.id,
				leases: leaseGroups.length,
			},
			"payment history retrieved successfully",
		);

		return render("payment-history", { leases: leaseGroups });
	} catch (error) {
		log?.error(
			{ error, tenantId: tenant.id },
			"failed to retrieve payment history",
		);
		throw error;
	}
};
