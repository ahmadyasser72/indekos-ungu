import { db } from "@indekos/database";
import type { Tenant } from "@indekos/database/schema";
import { formatDate } from "@indekos/utilities/date";

import type { Logger } from "pino";

import { render } from "~/template";
import { STATUS_LABEL } from "./constants";

export const listComplaints = async (
	tenant: Tenant,
	options?: { logger?: Logger },
): Promise<string> => {
	const log = options?.logger?.child({ submodule: "commands:list-complaints" });

	log?.debug({ tenantId: tenant.id }, "retrieving latest complaints");

	try {
		const latest = await db.query.complaints.findMany({
			where: { tenantId: tenant.id },
			limit: 3,
		});

		if (latest.length === 0) {
			log?.info({ tenantId: tenant.id }, "no complaints found");
			return "Belum ada komplain yang Anda kirimkan.";
		}

		log?.info(
			{ tenantId: tenant.id, complaintCount: latest.length },
			"complaints retrieved successfully",
		);

		return render("list-complaints", {
			items: latest.map(({ id, description, createdAt, status }) => ({
				id,
				description,
				createdAt: formatDate(createdAt),
				status: STATUS_LABEL[status],
			})),
		});
	} catch (error) {
		log?.error({ error, tenantId: tenant.id }, "failed to retrieve complaints");
		throw error;
	}
};
