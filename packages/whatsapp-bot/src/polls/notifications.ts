import { db, eq } from "@e-kos/database";
import { getPaymentUrlFromReference } from "@e-kos/database/duitku";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	notifications,
} from "@e-kos/database/schema";

import type { WASocket } from "baileys";

export async function pollNotifications(sock: WASocket, botUserId: number) {
	const pending = await db.query.notifications.findMany({
		where: { status: "pending" },
	});

	for (const notification of pending) {
		try {
			const tenant = await db.query.tenants.findFirst({
				where: { id: notification.tenantId },
			});

			if (!tenant?.phoneNumber) {
				// Tidak ada nomor HP — tandai failed agar tidak ditarik lagi
				await db
					.update(notifications)
					.set({ status: "failed" })
					.where(eq(notifications.id, notification.id));
				continue;
			}

			let msg: string;

			// Hoist shared invoice + lease + room query
			const invoiceData = notification.invoiceId
				? await db.query.invoices.findFirst({
						where: { id: notification.invoiceId },
						with: { lease: { with: { room: true } } },
					})
				: undefined;

			if (notification.type === "welcome") {
				const lease = await db.query.leases.findFirst({
					where: { tenantId: notification.tenantId, isActive: true },
					with: { room: true },
				});

				msg = `*🎉 Selamat Datang di ${lease?.room?.roomNumber ? `Kamar ${lease.room.roomNumber} - ` : ""}Indekos Ungu!*\n\n`;
				msg += `Halo *${tenant.fullName}*,\n\n`;
				msg += `Data Anda telah terdaftar sebagai penghuni kos. Untuk mengaktifkan akun Anda, silakan balas pesan ini dengan kata:\n\n`;
				msg += `*YA*\n\n`;
				msg += `Setelah itu, Anda bisa menggunakan berbagai layanan seperti:\n`;
				msg += `• *tagihan* — Cek tagihan sewa\n`;
				msg += `• *riwayat* — Riwayat pembayaran\n`;
				msg += `• *komplain* — Ajukan keluhan\n`;
				msg += `• *info* — Info kamar & data diri\n\n`;
				msg += `_Pesan ini dikirim otomatis oleh sistem._`;
			} else if (notification.type === "payment_success") {
				msg = `*✅ Pembayaran Diterima*\n\n`;
				msg += `Yth. ${tenant.fullName},\n\n`;

				if (invoiceData?.lease?.room) {
					msg += `📍 Kamar: ${invoiceData.lease.room.roomNumber}\n`;
					msg += `💰 Jumlah: Rp ${invoiceData.amount.toLocaleString()}\n`;
					msg += `📅 Pembayaran: ${invoiceData.dueDate.toLocaleDateString()}\n\n`;
				}

				msg += `Terima kasih telah membayar tepat waktu.`;
			} else {
				msg = `*🔔 Pengingat Pembayaran*\n\n`;
				msg += `Yth. ${tenant.fullName},\n`;
				msg += `Tagihan sewa Anda akan segera jatuh tempo.\n\n`;

				if (invoiceData?.lease?.room) {
					msg += `📍 Kamar: ${invoiceData.lease.room.roomNumber}\n`;
					msg += `💰 Jumlah: Rp ${invoiceData.amount.toLocaleString()}\n`;
					msg += `📅 Batas bayar: ${invoiceData.dueDate.toLocaleDateString()}\n\n`;

					if (invoiceData.duitkuReference) {
						msg += `💳 Bayar sekarang: ${getPaymentUrlFromReference(invoiceData.duitkuReference)}\n\n`;
					}
				}

				msg += `Silakan lakukan pembayaran tepat waktu.\n`;
				msg += `Ketik *tagihan* untuk info lebih lanjut.`;
				msg += `\n\n_Pesan ini dikirim otomatis oleh sistem._`;
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

			const actionDesc =
				notification.type === "welcome"
					? `Bot mengirim pesan selamat datang ke tenant #${tenant.id}`
					: notification.type === "payment_success"
						? `Bot mengirim konfirmasi pembayaran sukses ke tenant #${tenant.id}`
						: `Bot mengirim pengingat pembayaran ke tenant #${tenant.id}`;

			await db.insert(auditLogs).values({
				userId: botUserId,
				action: "CREATE",
				tableName: "notifications",
				details: auditDetail.notification(actionDesc, "whatsapp", tenant.id),
			});
		} catch (err) {
			console.error("Send notification failed:", err);
			await db
				.update(notifications)
				.set({ status: "failed" })
				.where(eq(notifications.id, notification.id));
		}
	}
}
