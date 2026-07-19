import { db, NOTIFICATION_STATUS, NOTIFICATION_TYPES } from "@indekos/database";
import { formatInvoiceNumber } from "@indekos/utilities/transforms";

import { z } from "astro/zod";
import { countBy } from "es-toolkit";

import type { Stat } from "~/components/data/stats.astro";
import { periodSchema, querySchema, statusSchema } from "~/lib/query";

export const notificationQuerySchema = z.object({
	query: querySchema,
	period: periodSchema,
	type: statusSchema(NOTIFICATION_TYPES),
	status: statusSchema(NOTIFICATION_STATUS),
});

export const fetchNotifications = async (
	params: z.infer<typeof notificationQuerySchema>,
) => {
	const notifications = await db.query.notifications.findMany({
		where: {
			...(params.query && {
				OR: [{ tenant: { fullName: { like: `%${params.query}%` } } }],
			}),

			...(params.type && { type: params.type }),
			...(params.status && { status: params.status }),

			createdAt: {
				gte: params.period.from.startOf("day").toDate(),
				lte: params.period.to.endOf("day").toDate(),
			},
		},
		columns: {
			id: true,
			createdAt: true,
			type: true,
			status: true,
			invoiceId: true,
		},
		with: {
			tenant: true,
			room: true,
			invoice: true,
			chatbotMessage: true,
		},
		orderBy: { id: "desc" },
	});

	return notifications.map(
		({
			chatbotMessage,
			invoiceId,
			invoice,
			tenant,
			room,
			...notification
		}) => ({
			...notification,
			sentAt: chatbotMessage?.sentAt,
			tenantName: tenant.fullName,
			roomNumber: room?.roomNumber ?? "-",
			invoiceNumber: invoice ? formatInvoiceNumber(invoice) : "-",
		}),
	);
};

export const NOTIFICATION_TYPE_BADGES = {
	reminder: "badge-warning",
	overdue_reminder: "badge-error",
	payment_success: "badge-success",
	welcome: "badge-primary",
	phone_change: "badge-secondary",
	move_success: "badge-info",
	move_additional_payment: "badge-info",
	move_payment_success: "badge-success",
} satisfies Record<(typeof NOTIFICATION_TYPES)[number], string>;

export const NOTIFICATION_TYPE_LABELS = {
	reminder: "Pengingat",
	overdue_reminder: "Pengingat Jatuh Tempo",
	payment_success: "Pembayaran Sukses",
	welcome: "Verifikasi",
	phone_change: "Verifikasi Ganti Nomor",
	move_success: "Pindah Kamar",
	move_additional_payment: "Selisih Biaya Pindah Kamar",
	move_payment_success: "Pembayaran Selisih Pindah Kamar",
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

export const getNotificationStats = (
	notifications: Awaited<ReturnType<typeof fetchNotifications>>,
): Stat[] => {
	const {
		sent = 0,
		pending = 0,
		failed = 0,
	} = countBy(notifications, ({ status }) => status);

	const successRate =
		notifications.length > 0
			? Math.round((sent / notifications.length) * 100)
			: 0;

	return [
		{
			title: "Total Notifikasi",
			value: notifications.length,
			desc: "Seluruh notifikasi dalam periode",
			icon: "lucide:bell" as const,
		},
		{
			title: "Terkirim",
			value: sent,
			desc: `${successRate}% sukses terkirim`,
			icon: "lucide:circle-check" as const,
		},
		{
			title: "Pending & Gagal",
			value: pending + failed,
			desc: `${pending} menunggu, ${failed} gagal`,
			icon: "lucide:clock" as const,
		},
	];
};
