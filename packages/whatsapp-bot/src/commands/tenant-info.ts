import { db } from "@e-kos/database";
import { tenants } from "@e-kos/database/schema";

export async function tenantInfo(
	tenant: typeof tenants.$inferSelect,
): Promise<string> {
	const activeLease = await db.query.leases.findFirst({
		where: { tenantId: tenant.id, isActive: true },
		with: { room: true },
	});

	if (!activeLease?.room) {
		return "Anda tidak memiliki kontrak sewa yang aktif.";
	}

	const endDate = activeLease.endDate
		? activeLease.endDate.toLocaleDateString()
		: "Berlangsung";

	return [
		"*👤 Info Penghuni & Kamar*",
		"",
		"━━━━━━━━━━━━━━━━━━━",
		"*Data Diri*",
		`Nama: ${tenant.fullName}`,
		`No. HP: ${tenant.phoneNumber}`,
		`Asal: ${tenant.originRegion ?? "-"}`,
		"",
		"*Info Kamar*",
		`📍 No. Kamar: ${activeLease.room.roomNumber}`,
		`🏠 Tipe: ${activeLease.room.roomType ?? "-"}`,
		`💰 Sewa: Rp ${activeLease.room.monthlyPrice.toLocaleString()}/bulan`,
		`📅 Mulai: ${activeLease.startDate.toLocaleDateString()}`,
		`📅 Selesai: ${endDate}`,
		"━━━━━━━━━━━━━━━━━━━",
		"",
		"Ketik *help* untuk bantuan lebih lanjut.",
	].join("\n");
}
