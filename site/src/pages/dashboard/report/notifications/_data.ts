import { db, NOTIFICATION_STATUS, NOTIFICATION_TYPES } from "@indekos/database";
import { parseDateRange } from "@indekos/utilities/date";
import { formatInvoiceNumber } from "@indekos/utilities/transforms";

import { z } from "astro/zod";

import { periodFields, querySchema, statusSchema } from "~/lib/query";

export const notificationQuerySchema = z.object({
	query: querySchema,
	...periodFields,
	type: statusSchema(NOTIFICATION_TYPES),
	status: statusSchema(NOTIFICATION_STATUS),
});

export const fetchNotifications = async (
	params: z.infer<typeof notificationQuerySchema>,
) => {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const notifications = await db.query.notifications.findMany({
		where: {
			...(params.query && {
				OR: [{ tenant: { fullName: { like: `%${params.query}%` } } }],
			}),

			...(params.type && { type: params.type }),
			...(params.status && { status: params.status }),

			createdAt: { gte: startDate, lte: endDate },
		},
		columns: {
			id: true,
			createdAt: true,
			type: true,
			status: true,
			invoiceId: true,
		},
		with: {
			tenant: {
				with: {
					lease: {
						with: { room: true },
					},
				},
			},
			invoice: true,
			chatbotMessage: true,
		},
		orderBy: { id: "desc" },
	});

	return notifications.map(
		({ chatbotMessage, invoiceId, invoice, tenant, ...notification }) => ({
			...notification,
			sentAt: chatbotMessage?.sentAt,
			tenantName: tenant.fullName,
			roomNumber: tenant.lease?.room.roomNumber ?? "-",
			invoiceNumber: invoice ? formatInvoiceNumber(invoice) : "-",
		}),
	);
};

export const NOTIFICATION_TYPE_BADGES = {
	reminder: "badge-warning",
	payment_success: "badge-success",
	welcome: "badge-primary",
	custom: "badge-info",
} satisfies Record<(typeof NOTIFICATION_TYPES)[number], string>;

export const NOTIFICATION_TYPE_LABELS = {
	reminder: "Pengingat",
	payment_success: "Pembayaran Sukses",
	welcome: "Verifikasi",
	custom: "Custom",
} satisfies Record<(typeof NOTIFICATION_TYPES)[number], string>;

export const NOTIFICATION_STATUS_LABELS = {
	pending: "Menunggu",
	sent: "Terkirim",
	failed: "Gagal",
} satisfies Record<(typeof NOTIFICATION_STATUS)[number], string>;

export const NOTIFICATION_STATUS_BADGES = {
	pending: "badge-warning",
	sent: "badge-success",
	failed: "badge-error",
} satisfies Record<(typeof NOTIFICATION_STATUS)[number], string>;
