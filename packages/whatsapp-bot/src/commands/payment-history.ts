import { db } from "@e-kos/database";
import { tenants } from "@e-kos/database/schema";

export async function paymentHistory(
	tenant: typeof tenants.$inferSelect,
): Promise<string> {
	const activeLease = await db.query.leases.findFirst({
		columns: { id: true },
		where: { tenantId: tenant.id, isActive: true },
	});

	if (!activeLease) {
		return "Anda tidak memiliki riwayat pembayaran.";
	}

	const paid = await db.query.invoices.findMany({
		columns: { id: true, amount: true, dueDate: true },
		where: { leaseId: activeLease.id, status: "paid" },
		limit: 10,
	});

	if (paid.length === 0) {
		return "Belum ada riwayat pembayaran lunas.";
	}

	const lines: string[] = [];
	lines.push(`*📋 Riwayat Pembayaran (${paid.length} terakhir)*`);
	lines.push("");

	for (const inv of paid) {
		lines.push(`• Invoice #${inv.id}`);
		lines.push(`  Jumlah: Rp ${inv.amount.toLocaleString()}`);
		lines.push(`  Lunas: ${inv.dueDate.toLocaleDateString()}`);
		lines.push("");
	}

	lines.push("Untuk detail lebih lanjut, hubungi admin.");
	return lines.join("\n");
}
