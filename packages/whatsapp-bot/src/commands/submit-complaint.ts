import { db } from "@e-kos/database";
import { auditLogs, complaints, tenants } from "@e-kos/database/schema";

export async function submitComplaint(
	tenant: typeof tenants.$inferSelect,
	text: string,
	botUserId: number,
): Promise<string> {
	const complaintDesc = text.replace(/^komplain\s*/i, "").trim();

	if (!complaintDesc || complaintDesc.length < 5) {
		return [
			"*📝 Ajukan Komplain*",
			"",
			"Silakan kirim keluhan dengan format:",
			"",
			"*komplain [deskripsi keluhan]*",
			"",
			"Contoh:",
			"• komplain AC kamar tidak dingin",
			"• komplain kran wastafel bocor",
			"• komplain lampu kamar mati",
			"• komplain tetangga berisik",
			"",
			"Setelah komplain terkirim, Anda akan mendapat ID laporan sebagai referensi.",
		].join("\n");
	}

	const [newComplaint] = await db
		.insert(complaints)
		.values({
			tenantId: tenant.id,
			description: complaintDesc,
			status: "open",
		})
		.returning({ id: complaints.id, createdAt: complaints.createdAt });

	await db.insert(auditLogs).values({
		userId: botUserId,
		action: "INSERT",
		tableName: "complaints",
		recordId: newComplaint.id,
		details: `Bot membuat komplain dari tenant #${tenant.id}: "${complaintDesc.slice(0, 100)}"`,
	});

	return [
		"*✅ Komplain Diterima*",
		"",
		"Terima kasih, laporan Anda telah kami catat.",
		"",
		"📋 *Detail Komplain*",
		"━━━━━━━━━━━━━━━━━━━",
		`🆔 ID Laporan: #${newComplaint.id}`,
		`📝 Keluhan: ${complaintDesc}`,
		`📅 Tanggal: ${newComplaint.createdAt.toLocaleDateString()}`,
		"━━━━━━━━━━━━━━━━━━━",
		"",
		"Status: *Menunggu ditangani*",
		"",
		"Kami akan segera memproses laporan Anda.",
		"Simpan ID laporan untuk referensi.",
	].join("\n");
}
