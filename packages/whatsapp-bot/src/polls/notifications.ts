import { db, eq } from "@indekos/database";
import { getPaymentUrlFromReference } from "@indekos/database/duitku";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	notifications,
} from "@indekos/database/schema";
import { formatDate } from "@indekos/utilities/date";
import { formatCurrency } from "@indekos/utilities/transforms";

import type { WASocket } from "baileys";

import { render } from "~/template";

export const pollNotifications = async (sock: WASocket, botUserId: number) => {
	const pending = await db.query.notifications.findMany({
		where: { status: "pending" },
	});

	for (const notification of pending) {
		try {
			const tenant = await db.query.tenants.findFirst({
				where: { id: notification.tenantId },
			});

			if (!tenant?.phoneNumber) {
				await db
					.update(notifications)
					.set({ status: "failed" })
					.where(eq(notifications.id, notification.id));
				continue;
			}

			// Hoist shared invoice + lease + room query
			const invoiceData = notification.invoiceId
				? await db.query.invoices.findFirst({
						where: { id: notification.invoiceId },
						with: { lease: { with: { room: true } } },
					})
				: undefined;

			let msg: string;
			if (
				notification.type === "welcome" ||
				notification.type === "phone_change"
			) {
				const lease = await db.query.leases.findFirst({
					where: { tenantId: notification.tenantId, isActive: true },
					with: { room: true },
				});

				msg =
					notification.type === "welcome"
						? render("welcome", {
								fullName: tenant.fullName,
								roomNumber: lease?.room?.roomNumber ?? null,
							})
						: render("phone-change-verification", {
								fullName: tenant.fullName,
							});
			} else if (notification.type === "payment_success") {
				const siteUrl = process.env.SITE_URL;
				const invoiceUrl =
					siteUrl && invoiceData
						? `${siteUrl}/invoice/${invoiceData.id}`
						: null;

				msg = render("payment-success", {
					fullName: tenant.fullName,
					roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
					amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
					date: invoiceData ? formatDate(invoiceData.dueDate) : null,
					invoiceUrl,
				});
			} else if (notification.type === "overdue_reminder") {
				msg = render("overdue-reminder", {
					fullName: tenant.fullName,
					roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
					amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
					dueDate: invoiceData ? formatDate(invoiceData.dueDate) : null,
					paymentUrl: invoiceData?.duitkuReference
						? getPaymentUrlFromReference(invoiceData.duitkuReference)
						: null,
				});
			} else {
				msg = render("payment-reminder", {
					fullName: tenant.fullName,
					roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
					amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
					dueDate: invoiceData ? formatDate(invoiceData.dueDate) : null,
					paymentUrl: invoiceData?.duitkuReference
						? getPaymentUrlFromReference(invoiceData.duitkuReference)
						: null,
				});
			}

			await sock.sendMessage(`${tenant.phoneNumber}@s.whatsapp.net`, {
				text: msg,
			});

			const [sent] = await db
				.insert(chatbotMessages)
				.values({
					tenantId: notification.tenantId,
					direction: "outgoing",
					message: msg,
				})
				.returning({ id: chatbotMessages.id });

			await db
				.update(notifications)
				.set({ status: "sent", chatbotMessageId: sent.id })
				.where(eq(notifications.id, notification.id));

			const notificationMessages = {
				welcome: "pesan selamat datang",
				phone_change: "verifikasi ganti nomor",
				payment_success: "konfirmasi pembayaran sukses",
				overdue_reminder: "pengingat invoice jatuh tempo",
				reminder: "pengingat pembayaran",
			} satisfies Record<typeof notification.type, string>;
			const botAction = `Bot mengirim ${notificationMessages[notification.type]} ke tenant #${tenant.id}`;

			await db.insert(auditLogs).values({
				userId: botUserId,
				action: "CREATE",
				tableName: "notifications",
				details: auditDetail.notification(botAction, "whatsapp", tenant.id),
			});
		} catch (error) {
			console.error("Send notification failed:", error);
			await db
				.update(notifications)
				.set({ status: "failed" })
				.where(eq(notifications.id, notification.id));
		}
	}
};
