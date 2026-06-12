import { db, eq } from "@e-kos/database";
import { auditLogs, notifications, tenants } from "@e-kos/database/schema";

import type { WASocket } from "baileys";

export async function pollNotifications(sock: WASocket, botUserId: number) {
	const pending = await db.query.notifications.findMany({
		where: { status: "pending" },
	});

	for (const n of pending) {
		try {
			const tenant = await db.query.tenants.findFirst({
				where: { id: n.tenantId },
			});

			if (!tenant?.phoneNumber) continue;

			let msg = `*🔔 Pengingat Pembayaran*\n\n`;
			msg += `Yth. ${tenant.fullName},\n`;
			msg += `Tagihan sewa Anda akan segera jatuh tempo.\n\n`;

			if (n.invoiceId) {
				const invoiceData = await db.query.invoices.findFirst({
					where: { id: n.invoiceId },
					with: { lease: { with: { room: true } } },
				});

				if (invoiceData?.lease?.room) {
					msg += `📍 Kamar: ${invoiceData.lease.room.roomNumber}\n`;
					msg += `💰 Jumlah: Rp ${invoiceData.amount.toLocaleString()}\n`;
					msg += `📅 Batas bayar: ${invoiceData.dueDate.toLocaleDateString()}\n\n`;
				}
			}

			msg += `Silakan lakukan pembayaran tepat waktu.\n`;
			msg += `Ketik *tagihan* untuk info lebih lanjut.`;
			msg += `\n\n_Pesan ini dikirim otomatis oleh sistem._`;

			await sock.sendMessage(`${tenant.phoneNumber}@s.whatsapp.net`, {
				text: msg,
			});

			await db
				.update(notifications)
				.set({ status: "sent" })
				.where(eq(notifications.id, n.id));

			await db.insert(auditLogs).values({
				userId: botUserId,
				action: "INSERT",
				tableName: "notifications",
				details: `Bot mengirim pengingat pembayaran ke tenant #${tenant.id} (${tenant.phoneNumber})`,
			});
		} catch (err) {
			console.error("[Bot] Send notification failed:", err);
			await db
				.update(notifications)
				.set({ status: "failed" })
				.where(eq(notifications.id, n.id));
		}
	}
}
