import { db } from "@indekos/database";
import { formatDate } from "@indekos/utilities/date";

import { render } from "~/template";
import { STATUS_LABEL } from "./constants";
import type { CommandHandlerFunction } from "./types";

export const listComplaints: CommandHandlerFunction = async (
	tenant,
	options,
) => {
	const log = options?.logger?.child({ submodule: "commands:list-complaints" });

	log?.debug({ tenantId: tenant.id }, "retrieving latest complaints");

	try {
		const latest = await db.query.complaints.findMany({
			where: { tenantId: tenant.id },
			with: { room: true },
			limit: 3,
			orderBy: { id: "desc" },
		});

		if (latest.length === 0) {
			log?.info({ tenantId: tenant.id }, "no complaints found");
			return "Belum ada komplain yang Anda kirimkan.";
		}

		log?.info(
			{ tenantId: tenant.id, complaint: latest.length },
			"complaints retrieved successfully",
		);

		return render("list-complaints", {
			items: latest.map(({ id, description, createdAt, status, room }) => ({
				id,
				description,
				createdAt: formatDate(createdAt),
				status: STATUS_LABEL[status],
				roomNumber: room.roomNumber,
			})),
		});
	} catch (error) {
		log?.error({ error, tenantId: tenant.id }, "failed to retrieve complaints");
		throw error;
	}
};
