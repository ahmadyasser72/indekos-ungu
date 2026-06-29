import { db } from "@e-kos/database";
import type { Tenant } from "@e-kos/database/schema";
import { formatDate } from "@e-kos/utilities/date";
import { formatCurrency } from "@e-kos/utilities/transforms";

import { render } from "../template";

export const tenantInfo = async (tenant: Tenant): Promise<string> => {
	const activeLease = await db.query.leases.findFirst({
		where: { tenantId: tenant.id, isActive: true },
		with: { room: true, invoices: { where: { status: "unpaid" } } },
	});

	if (!activeLease?.room) {
		return "Anda tidak memiliki kontrak sewa yang aktif.";
	}

	const hasUnpaid = activeLease.invoices.length > 0;

	return render("tenant-info", {
		fullName: tenant.fullName,
		phoneNumber: tenant.phoneNumber,
		originRegion: tenant.originRegion ?? "-",
		roomNumber: activeLease.room.roomNumber,
		roomType: activeLease.room.roomType,
		monthlyPrice: formatCurrency(activeLease.room.monthlyPrice),
		startDate: formatDate(activeLease.startDate),
		endDate: activeLease.endDate
			? formatDate(activeLease.endDate)
			: "Berlangsung",
		hasUnpaid,
	});
};
