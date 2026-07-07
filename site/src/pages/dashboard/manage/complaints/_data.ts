import { COMPLAINT_STATUS, db } from "@indekos/database";
import { parseDateRange } from "@indekos/utilities/date";

import { z } from "astro/zod";
import { countBy } from "es-toolkit";

import type { Stat } from "~/components/data/stats.astro";
import { periodFields, querySchema, statusSchema, paginationFields } from "~/lib/query";

export const fetchComplaints = async (
	params: z.infer<typeof complaintQuerySchema>,
) => {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const complaints = await db.query.complaints.findMany({
		where: {
			...(params.query && {
				OR: [
					{ description: { like: `%${params.query}%` } },
					{ tenant: { fullName: { like: `%${params.query}%` } } },
				],
			}),

			...(params.status && { status: params.status }),

			createdAt: { gte: startDate, lte: endDate },
		},
		with: {
			tenant: { with: { lease: { with: { room: true } } } },
			resolver: true,
		},
		orderBy: { createdAt: "desc" },
	});

	return complaints.map(({ tenant, resolver, ...complaint }) => ({
		...complaint,
		tenantName: tenant.fullName,
		roomNumber: tenant.lease?.room?.roomNumber ?? null,
		resolvedByUserName: resolver?.displayName ?? null,
	}));
};

export const getComplaintStats = (
	complaints: Awaited<ReturnType<typeof fetchComplaints>>,
): Stat[] => {
	const {
		open = 0,
		in_progress = 0,
		resolved = 0,
	} = countBy(complaints, (complaint) => complaint.status);

	return [
		{
			title: "Total Komplain",
			value: complaints.length,
			icon: "lucide:file-text",
		},
		{
			title: "Terbuka",
			value: open,
			icon: "lucide:alert-circle",
		},
		{
			title: "Proses",
			value: in_progress,
			icon: "lucide:clock",
		},
		{
			title: "Selesai",
			value: resolved,
			icon: "lucide:circle-check",
		},
	];
};

export const complaintQuerySchema = z.object({
	query: querySchema,
	status: statusSchema(COMPLAINT_STATUS),
	...periodFields,
	...paginationFields,
});

export const COMPLAINT_STATUS_BADGES = {
	open: "badge-error",
	in_progress: "badge-warning",
	resolved: "badge-success",
} satisfies Record<(typeof COMPLAINT_STATUS)[number], string>;

export const COMPLAINT_STATUS_LABELS = {
	open: "Terbuka",
	in_progress: "Proses",
	resolved: "Selesai",
} satisfies Record<(typeof COMPLAINT_STATUS)[number], string>;

export const COMPLAINT_STATUS_BORDERS = {
	open: "border-error/40",
	in_progress: "border-warning/40",
	resolved: "border-success/40",
} satisfies Record<(typeof COMPLAINT_STATUS)[number], string>;
