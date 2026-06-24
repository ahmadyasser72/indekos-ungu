import { db, NOTIFICATION_STATUS, NOTIFICATION_TYPES } from "@e-kos/database";

import { z } from "astro/zod";

import { parseDateRange } from "~/lib/date";
import { periodFields, querySchema, statusSchema } from "~/lib/query";
import { formatInvoiceNumber } from "~/lib/transforms";

export const notificationQuerySchema = z.object({
	query: querySchema,
	...periodFields,
	type: statusSchema(NOTIFICATION_TYPES),
});

export type NotificationRow = {
	id: number;
	time: Date | null;
	tenantName: string;
	roomNumber: string;
	invoiceNumber: string;
	type: string;
	status: string;
};

export async function fetchNotifications(
	params: z.infer<typeof notificationQuerySchema>,
	extra?: { useQuery?: boolean },
): Promise<NotificationRow[]> {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const where: Record<string, unknown> = {
		createdAt: { gte: startDate, lte: endDate },
	};

	if (extra?.useQuery && params.query) {
		where.tenant = { fullName: { like: `%${params.query}%` } };
	}
	if (params.type) {
		where.type = params.type;
	}

	const notifications = await db.query.notifications.findMany({
		where,
		with: {
			tenant: {
				with: {
					leases: {
						where: { isActive: true },
						with: { room: true },
					},
				},
			},
			invoice: true,
			chatbotMessage: true,
		},
		orderBy: { id: "desc" },
	});

	return notifications.map((n) => {
		const activeLease = n.tenant?.leases?.[0];
		return {
			id: n.id,
			time: n.chatbotMessage?.sentAt ?? null,
			tenantName: n.tenant?.fullName ?? "-",
			roomNumber: activeLease?.room?.roomNumber ?? "-",
			invoiceNumber: n.invoiceId ? formatInvoiceNumber(n.invoiceId) : "-",
			type: n.type,
			status: n.status,
		};
	});
}

export const NOTIFICATION_TYPE_BADGES: Record<
	(typeof NOTIFICATION_TYPES)[number],
	string
> = {
	reminder: "badge-warning",
	payment_success: "badge-success",
	welcome: "badge-primary",
	custom: "badge-info",
};

export const NOTIFICATION_TYPE_LABELS: Record<
	(typeof NOTIFICATION_TYPES)[number],
	string
> = {
	reminder: "Pengingat",
	payment_success: "Pembayaran Berhasil",
	welcome: "Selamat Datang",
	custom: "Pesan Khusus",
};

export const NOTIFICATION_STATUS_BADGES: Record<
	(typeof NOTIFICATION_STATUS)[number],
	string
> = {
	pending: "badge-warning",
	sent: "badge-success",
	failed: "badge-error",
};
