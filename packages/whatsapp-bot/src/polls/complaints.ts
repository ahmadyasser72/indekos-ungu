import { db, eq } from "@e-kos/database";
import { auditLogs, complaints } from "@e-kos/database/schema";

import type { WASocket } from "baileys";

export async function pollResolvedComplaints(
	sock: WASocket,
	botUserId: number,
) {
	const resolved = await db.query.complaints.findMany({
		where: { status: "resolved", resolvedNotified: false },
	});

	for (const c of resolved) {
		try {
			const tenant = await db.query.tenants.findFirst({
				where: { id: c.tenantId },
			});

			if (!tenant?.phoneNumber) continue;

			let resolverName = "Staf";
			if (c.resolvedBy) {
				const resolver = await db.query.users.findFirst({
					where: { id: c.resolvedBy },
				});
				if (resolver) resolverName = resolver.displayName ?? resolver.username;
			}

			const msg = [
				"*✅ Komplain Selesai Diproses*",
				"",
				`Yth. ${tenant.fullName},`,
				"",
				`Laporan komplain Anda telah selesai ditangani.`,
				"",
				"📋 *Detail*",
				"━━━━━━━━━━━━━━━━━━━",
				`🆔 ID Laporan: #${c.id}`,
				`📝 Keluhan: ${c.description}`,
				c.resolveNotes ? `📌 Catatan: ${c.resolveNotes}` : "",
				`👤 Ditangani oleh: ${resolverName}`,
				"━━━━━━━━━━━━━━━━━━━",
				"",
				"Terima kasih atas laporannya.",
				"Jika ada kendala lain, silakan hubungi kami kembali.",
			]
				.filter(Boolean)
				.join("\n");

			await sock.sendMessage(`${tenant.phoneNumber}@s.whatsapp.net`, {
				text: msg,
			});

			await db
				.update(complaints)
				.set({ resolvedNotified: true })
				.where(eq(complaints.id, c.id));

			await db.insert(auditLogs).values({
				userId: botUserId,
				action: "INSERT",
				tableName: "notifications",
				details: `Bot memberitahu tenant #${tenant.id} bahwa komplain #${c.id} selesai diproses`,
			});

			console.log(
				`[Bot] Complaint #${c.id} resolved notified to ${tenant.phoneNumber}`,
			);
		} catch (err) {
			console.error(
				`[Bot] Complaint #${c.id} resolved notification failed:`,
				err,
			);
		}
	}
}
