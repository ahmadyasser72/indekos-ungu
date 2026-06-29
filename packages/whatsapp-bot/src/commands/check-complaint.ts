import { db } from "@e-kos/database";
import type { Tenant } from "@e-kos/database/schema";
import { formatDate } from "@e-kos/utilities/date";

import { render } from "../template";
import { STATUS_LABEL } from "./constants";

export const checkComplaint = async (
	tenant: Tenant,
	complaintId: number,
): Promise<string> => {
	const complaint = await db.query.complaints.findFirst({
		where: { id: complaintId, tenantId: tenant.id },
	});

	if (!complaint) {
		return "Komplain dengan ID tersebut tidak ditemukan.";
	}

	let resolverName = "-";
	if (complaint.resolvedBy) {
		const resolver = await db.query.users.findFirst({
			where: { id: complaint.resolvedBy },
		});
		if (resolver) resolverName = resolver.displayName ?? resolver.username;
	}

	return render("check-complaint", {
		id: complaint.id,
		description: complaint.description,
		createdAt: formatDate(complaint.createdAt),
		processedAt: complaint.processedAt
			? formatDate(complaint.processedAt)
			: null,
		resolvedAt: complaint.resolvedAt ? formatDate(complaint.resolvedAt) : null,
		status: STATUS_LABEL[complaint.status],
		resolveNotes: complaint.resolveNotes ?? null,
		resolverName,
	});
};
