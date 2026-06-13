import { db } from "@e-kos/database";
import { tenants } from "@e-kos/database/schema";

export async function checkBills(
	tenant: typeof tenants.$inferSelect,
): Promise<string> {
	const activeLease = await db.query.leases.findFirst({
		where: { tenantId: tenant.id, isActive: true },
		with: {
			room: true,
			invoices: {
				where: { status: "unpaid" },
			},
		},
	});

	if (!activeLease?.room) {
		return "📍 Anda tidak memiliki kontrak sewa yang aktif.";
	}

	const unpaid = activeLease.invoices ?? [];
	const total = unpaid.reduce((sum, inv) => sum + inv.amount, 0);

	const lines: string[] = [];
	lines.push("*💰 Info Tagihan*");
	lines.push("");
	lines.push(`📍 Kamar: ${activeLease.room.roomNumber}`);
	lines.push(`🏠 Tipe: ${activeLease.room.roomType ?? "-"}`);
	lines.push(
		`💰 Sewa/bulan: Rp ${activeLease.room.monthlyPrice.toLocaleString()}`,
	);
	lines.push("");

	if (unpaid.length === 0) {
		lines.push("✅ *Semua pembayaran lunas!*");
		lines.push("Terima kasih telah membayar tepat waktu.");
	} else {
		lines.push(`⚠️ *${unpaid.length} tagihan belum dibayar*`);
		lines.push("━━━━━━━━━━━━━━━━━━━");

		for (const inv of unpaid) {
			lines.push(`• Invoice #${inv.id}`);
			lines.push(`  Jumlah: Rp ${inv.amount.toLocaleString()}`);
			lines.push(`  Jatuh tempo: ${inv.dueDate.toLocaleDateString()}`);
			lines.push("");
		}
		lines.push("━━━━━━━━━━━━━━━━━━━");
		lines.push(`💰 *Total: Rp ${total.toLocaleString()}*`);
		lines.push("");
		lines.push("Silakan hubungi admin untuk info pembayaran lebih lanjut.");
	}

	return lines.join("\n");
}
