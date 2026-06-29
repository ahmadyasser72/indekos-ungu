import { db } from "@e-kos/database";
import { complaints, type Tenant } from "@e-kos/database/schema";
import { formatDate } from "@e-kos/utilities/date";

import { render } from "../template";

export const submitComplaint = async (
	tenant: Tenant,
	text: string,
): Promise<string> => {
	const complaintDescription = text.replace(/^komplain\s*/i, "").trim();
	if (!complaintDescription || complaintDescription.length < 5) {
		return render("submit-complaint-format", {});
	}

	const [newComplaint] = await db
		.insert(complaints)
		.values({
			tenantId: tenant.id,
			description: complaintDescription,
			status: "open",
		})
		.returning({ id: complaints.id, createdAt: complaints.createdAt });

	return render("submit-complaint", {
		id: newComplaint.id,
		description: complaintDescription,
		createdAt: formatDate(newComplaint.createdAt),
	});
};
