import { db } from "@indekos/database";

import { z } from "astro/zod";
import { countBy } from "es-toolkit";

import type { Stat } from "~/components/data/stats.astro";
import { querySchema, statusSchema } from "~/lib/query";

export const TENANT_STATUS = ["active", "completed"] as const;

export const fetchTenants = async (
	params: z.infer<typeof tenantsQuerySchema>,
) => {
	const tenants = await db.query.tenants.findMany({
		where: {
			...(params.query && {
				OR: [
					{ fullName: { like: `%${params.query}%` } },
					{ phoneNumber: { like: `%${params.query}%` } },
					{ lease: { room: { roomNumber: { like: `%${params.query}%` } } } },
				],
			}),

			...(params.status &&
				((params.status === "active" && { lease: { isActive: true } }) ||
					(params.status === "completed" && {
						NOT: { lease: { isActive: true } },
					}))),
		},
		with: { lease: { with: { room: true } } },
	});

	return tenants.map(({ lease, ...tenant }) => ({
		...tenant,
		roomNumber: lease?.room.roomNumber ?? "-",
		startDate: lease?.startDate ?? null,
		endDate: lease?.endDate ?? null,
		isActive: !!lease,
	}));
};

export const tenantsQuerySchema = z.object({
	query: querySchema,
	status: statusSchema(TENANT_STATUS),
});

// Keys are derived display values (not from DB schema)
// because tenant status is computed from isActive boolean
export const TENANT_STATUS_BADGES: Record<string, string> = {
	Aktif: "badge-success",
	Selesai: "badge-neutral opacity-60",
	Pindah: "badge-neutral",
};

export const getTenantsStats = (
	tenants: Awaited<ReturnType<typeof fetchTenants>>,
): Stat[] => {
	const { active = 0, completed = 0 } = countBy(tenants, ({ isActive }) =>
		isActive ? "active" : "completed",
	);
	const { verified = 0, unverified = 0 } = countBy(tenants, ({ isVerified }) =>
		isVerified ? "verified" : "unverified",
	);

	return [
		{
			title: "Total Penghuni",
			value: tenants.length,
			desc: "Seluruh data penghuni",
			icon: "lucide:users" as const,
		},
		{
			title: "Sewa Aktif",
			value: active,
			desc: `${completed} sudah selesai`,
			icon: "lucide:user-check",
		},
		{
			title: "Terverifikasi",
			value: verified,
			desc: `${unverified} belum verifikasi`,
			icon: "lucide:badge-check",
		},
	];
};
