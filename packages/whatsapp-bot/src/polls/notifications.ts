import { db, eq } from "@indekos/database";
import { getPaymentUrlFromReference } from "@indekos/database/duitku";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	notifications,
	tenants,
} from "@indekos/database/schema";
import { formatDate } from "@indekos/utilities/date";
import type { Logger } from "@indekos/utilities/logger";
import { formatCurrency } from "@indekos/utilities/transforms";

import type { WASocket } from "baileys";

import { render } from "~/template";

export const pollNotifications = async (
	sock: WASocket,
	botUserId: number,
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "polls:notifications",
	});

	log?.debug("polling for pending notifications");
	try {
		const pending = await db.query.notifications.findMany({
			where: { status: "pending" },
		});
		if (pending.length === 0) return;

		log?.info(
			{ notification: pending.length },
			"found pending notifications to send",
		);

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
				if (notification.type === "welcome") {
					msg = render("welcome-invoice", {
						fullName: tenant.fullName,
						roomNumber: invoiceData!.lease.room.roomNumber,
						amount: formatCurrency(invoiceData!.amount),
						dueDate: formatDate(invoiceData!.dueDate),
						paymentUrl: getPaymentUrlFromReference(
							invoiceData!.duitkuReference!,
						),
					});
				} else if (notification.type === "phone_change") {
					msg = render("phone-change-verification", {
						fullName: tenant.fullName,
					});
				} else if (notification.type === "payment_success") {
					// Track if tenant is newly verified from payment
					const wasUnverified = !tenant.isVerified;

					// Auto-verify tenant on payment success
					if (wasUnverified) {
						await db
							.update(tenants)
							.set({ isVerified: true })
							.where(eq(tenants.id, tenant.id));
					}

					const siteUrl = process.env.SITE_URL;
					const invoiceUrl =
						siteUrl && invoiceData
							? `${siteUrl}/invoice/${invoiceData.id}`
							: null;

					if (wasUnverified) {
						// First payment: newly activated account
						msg = render("payment-success-verified", {
							fullName: tenant.fullName,
							roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
							amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
							date: invoiceData ? formatDate(invoiceData.dueDate) : null,
							invoiceUrl,
						});
					} else {
						// Regular payment
						msg = render("payment-success", {
							fullName: tenant.fullName,
							roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
							amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
							date: invoiceData ? formatDate(invoiceData.dueDate) : null,
							invoiceUrl,
						});
					}
				} else if (notification.type === "overdue_reminder") {
					msg = render("overdue-reminder", {
						fullName: tenant.fullName,
						roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
						amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
						dueDate: invoiceData ? formatDate(invoiceData.dueDate) : null,
					});
				} else if (notification.type === "reminder") {
					const siteUrl = process.env.SITE_URL;
					const paymentUrl =
						siteUrl && invoiceData?.duitkuReference
							? getPaymentUrlFromReference(invoiceData.duitkuReference)
							: null;

					msg = render("payment-reminder", {
						fullName: tenant.fullName,
						roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
						amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
						dueDate: invoiceData ? formatDate(invoiceData.dueDate) : null,
						paymentUrl,
					});
				} else if (notification.type === "move_additional_payment") {
					const siteUrl = process.env.SITE_URL;
					const paymentUrl =
						siteUrl && invoiceData?.duitkuReference
							? getPaymentUrlFromReference(invoiceData.duitkuReference)
							: null;

					msg = render("move-additional-payment", {
						fullName: tenant.fullName,
						roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
						amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
						dueDate: invoiceData ? formatDate(invoiceData.dueDate) : null,
						paymentUrl,
					});
				} else if (notification.type === "move_success") {
					msg = render("move-success", {
						fullName: tenant.fullName,
						roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
					});
				} else if (notification.type === "move_payment_success") {
					const wasUnverified = !tenant.isVerified;

					if (wasUnverified) {
						await db
							.update(tenants)
							.set({ isVerified: true })
							.where(eq(tenants.id, tenant.id));
					}

					const siteUrl = process.env.SITE_URL;
					const invoiceUrl =
						siteUrl && invoiceData
							? `${siteUrl}/invoice/${invoiceData.id}`
							: null;

					msg = render("move-payment-success", {
						fullName: tenant.fullName,
						roomNumber: invoiceData?.lease?.room?.roomNumber ?? null,
						amount: invoiceData ? formatCurrency(invoiceData.amount) : null,
						date: invoiceData ? formatDate(invoiceData.dueDate) : null,
						invoiceUrl,
					});
				} else {
					log?.warn(
						{ notificationId: notification.id, type: notification.type },
						"unknown notification type, skipping",
					);
					await db
						.update(notifications)
						.set({ status: "failed" })
						.where(eq(notifications.id, notification.id));
					continue;
				}

				await sock.sendMessage(`${tenant.phoneNumber}@s.whatsapp.net`, {
					text: msg,
				});

				const [sent] = await db
					.insert(chatbotMessages)
					.values({
						tenantId: notification.tenantId,
						roomId: notification.roomId,
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
					move_success: "konfirmasi pindah kamar",
					move_additional_payment: "selisih biaya pindah kamar",
					move_payment_success: "konfirmasi pembayaran selisih pindah kamar",
				} satisfies Record<typeof notification.type, string>;
				const botAction = `Bot mengirim ${notificationMessages[notification.type]} ke tenant #${tenant.id}`;

				await db.insert(auditLogs).values({
					userId: botUserId,
					action: "CREATE",
					tableName: "notifications",
					details: auditDetail.notification(botAction, "whatsapp", tenant.id),
				});
				log?.info(
					{
						notificationId: notification.id,
						tenantId: notification.tenantId,
						type: notification.type,
					},
					"notification sent successfully",
				);
			} catch (error) {
				log?.error(
					{
						error,
						notificationId: notification.id,
						tenantId: notification.tenantId,
					},
					"failed to send notification",
				);
				await db
					.update(notifications)
					.set({ status: "failed" })
					.where(eq(notifications.id, notification.id));
			}
		}
	} catch (error) {
		log?.error({ error }, "failed to poll notifications");
		throw error;
	}
};
