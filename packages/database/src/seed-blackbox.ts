import dayjs from "dayjs";

import { db, hashPassword } from "./index";
import { leases, rooms, tenants, users } from "./schema";

// ─── Helpers ────────────────────────────────────────────────────

const PHONE = "62887435034436";
const hash = (p: string) => hashPassword(p);

/**
 * Relative date shorthand.
 *
 * `monthOffset` = months from start of current month (negative = past).
 * `day` = day-of-month (1-31).
 * `hour` / `min` = time (default 08:00).
 */
const d = (monthOffset: number, day: number, hour = 8, min = 0): Date =>
	dayjs()
		.add(monthOffset, "month")
		.startOf("month")
		.date(day)
		.hour(hour)
		.minute(min)
		.second(0)
		.toDate();

// ─── Main ───────────────────────────────────────────────────────

const main = async () => {
	// ── Reset all seeded tables (fresh start) ──────────────────
	console.log("Resetting tables...");
	// Dependency order: leases → tenants → rooms → users
	await db.delete(leases);
	await db.delete(tenants);
	await db.delete(rooms);
	await db.delete(users);
	// Reset SQLite auto-increment counters
	await db.run(
		"DELETE FROM sqlite_sequence WHERE name IN ('leases','tenants','rooms','users')",
	);
	console.log("   Tables reset.");

	// ── 1. Users ───────────────────────────────────────────────
	console.log("1/4 Users...");

	const ensureUser = async (
		username: string,
		displayName: string,
		role: "admin" | "staff" | "owner" | "system",
		password?: string,
	) => {
		const [u] = await db
			.insert(users)
			.values({
				username,
				displayName,
				role,
				passwordHash: await hash(password ?? username),
			})
			.returning({ id: users.id });
		return u.id;
	};

	const systemId = await ensureUser("system", "System Scheduler", "system");
	const botId = await ensureUser("bot-wa", "WhatsApp Bot", "system");
	const adminId = await ensureUser(
		"admin",
		"Administrator",
		"admin",
		process.env.ADMIN_PASSWORD ?? "admin123",
	);
	const staffId = await ensureUser(
		"staff",
		"Staff Operator",
		"staff",
		"staff123",
	);
	const ownerId = await ensureUser("owner", "Pemilik Kos", "owner", "owner123");

	console.log(
		"   system=%d admin=%d staff=%d owner=%d",
		systemId,
		adminId,
		staffId,
		ownerId,
	);

	// ── 2. Rooms ───────────────────────────────────────────────
	console.log("2/4 Rooms...");

	const roomData = [
		{
			roomNumber: "A-01",
			roomType: "standard" as const,
			monthlyPrice: 500_000,
			isActive: true,
		},
		{
			roomNumber: "A-02",
			roomType: "standard" as const,
			monthlyPrice: 500_000,
			isActive: true,
		},
		{
			roomNumber: "A-03",
			roomType: "standard" as const,
			monthlyPrice: 550_000,
			isActive: true,
		},
		{
			roomNumber: "B-01",
			roomType: "standard" as const,
			monthlyPrice: 600_000,
			isActive: true,
		},
		{
			roomNumber: "B-02",
			roomType: "standard" as const,
			monthlyPrice: 600_000,
			isActive: true,
		},
		{
			roomNumber: "B-03",
			roomType: "standard" as const,
			monthlyPrice: 650_000,
			isActive: true,
		},
		{
			roomNumber: "C-01",
			roomType: "premium" as const,
			monthlyPrice: 1_000_000,
			isActive: true,
		},
		{
			roomNumber: "C-02",
			roomType: "premium" as const,
			monthlyPrice: 1_000_000,
			isActive: true,
		},
		{
			roomNumber: "C-03",
			roomType: "premium" as const,
			monthlyPrice: 1_200_000,
			isActive: true,
		},
		{
			roomNumber: "D-01",
			roomType: "standard" as const,
			monthlyPrice: 750_000,
			isActive: true,
		},
		{
			roomNumber: "D-02",
			roomType: "standard" as const,
			monthlyPrice: 750_000,
			isActive: true,
		},
		{
			roomNumber: "E-01",
			roomType: "premium" as const,
			monthlyPrice: 1_500_000,
			isActive: true,
		},
		{
			roomNumber: "E-02",
			roomType: "premium" as const,
			monthlyPrice: 1_500_000,
			isActive: false,
		},
		{
			roomNumber: "F-01",
			roomType: "standard" as const,
			monthlyPrice: 800_000,
			isActive: true,
		},
		{
			roomNumber: "F-02",
			roomType: "standard" as const,
			monthlyPrice: 800_000,
			isActive: true,
		},
	];

	for (const r of roomData) await db.insert(rooms).values(r).run();

	const allRooms = await db.query.rooms.findMany({ orderBy: { id: "asc" } });
	const rid = (num: string) => allRooms.find((r) => r.roomNumber === num)!.id;
	console.log("   %d rooms inserted", allRooms.length);

	// ── 3. Tenants ─────────────────────────────────────────────
	console.log("3/4 Tenants...");

	const tenantData = [
		{ fullName: "Rina Wijaya", originRegion: "Surabaya", isVerified: true },
		{ fullName: "Dimas Saputra", originRegion: "Malang", isVerified: true },
		{ fullName: "Siti Nurhaliza", originRegion: "Bandung", isVerified: true },
		{ fullName: "Agus Pratama", originRegion: "Yogyakarta", isVerified: true },
		{ fullName: "Dewi Lestari", originRegion: "Semarang", isVerified: true },
		{ fullName: "Bambang Susilo", originRegion: "Jakarta", isVerified: true },
		{ fullName: "Maya Anggraini", originRegion: "Denpasar", isVerified: true },
		{ fullName: "Fajar Hidayat", originRegion: "Makassar", isVerified: true },
		{ fullName: "Intan Permata", originRegion: "Palembang", isVerified: false },
		{ fullName: "Hendra Gunawan", originRegion: "Medan", isVerified: true },
		{ fullName: "Putri Ayu", originRegion: "Pontianak", isVerified: true },
		{ fullName: "Adi Nugroho", originRegion: "Solo", isVerified: true },
	];

	for (const t of tenantData)
		await db
			.insert(tenants)
			.values({ ...t, phoneNumber: PHONE })
			.run();

	const allTenants = await db.query.tenants.findMany({
		orderBy: { id: "asc" },
	});
	const tid = (idx: number) => allTenants[idx].id;
	console.log("   %d tenants inserted", allTenants.length);

	// ── 4. Leases ──────────────────────────────────────────────
	console.log("4/4 Leases...");

	// Active leases
	const activeLeaseData = [
		{ ti: 0, r: "A-01", start: d(-19, 1), end: null },
		{ ti: 1, r: "A-03", start: d(-17, 1), end: null },
		{ ti: 2, r: "B-01", start: d(-17, 1), end: d(1, 1) },
		{ ti: 3, r: "B-03", start: d(-16, 1), end: null },
		{ ti: 4, r: "C-01", start: d(-17, 1), end: d(7, 1) },
		{ ti: 5, r: "C-02", start: d(-15, 1), end: null },
		{ ti: 6, r: "C-03", start: d(-14, 1), end: null },
		{ ti: 7, r: "F-01", start: d(-12, 1), end: null },
		{ ti: 8, r: "D-02", start: d(-11, 15), end: null },
	];

	for (const l of activeLeaseData)
		await db
			.insert(leases)
			.values({
				tenantId: tid(l.ti),
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: true,
			})
			.run();

	// Completed leases
	const completedLeaseData = [
		{ ti: 9, r: "D-01", start: d(-29, 1), end: d(-24, 30) },
		{ ti: 10, r: "B-02", start: d(-27, 1), end: d(-16, 28) },
		{ ti: 11, r: "E-01", start: d(-24, 1), end: d(-18, 31) },
	];

	for (const l of completedLeaseData)
		await db
			.insert(leases)
			.values({
				tenantId: tid(l.ti),
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: false,
			})
			.run();

	console.log(
		"   %d leases inserted",
		activeLeaseData.length + completedLeaseData.length,
	);

	// ── 5. Multi-lease Tenants (edge-case: pindah kamar & sewa ulang) ───
	console.log("5/4 Multi-lease tenants (pindah kamar, sewa ulang)...");

	// 3 tenants baru, masing-masing punya 2 lease (completed + active)
	const multiTenantData = [
		{ fullName: "Ahmad Fauzi", originRegion: "Bogor", isVerified: true },
		{ fullName: "Dian Purnama", originRegion: "Lampung", isVerified: true },
		{ fullName: "Bayu Segara", originRegion: "Bali", isVerified: true },
	];

	const newTenantIds: number[] = [];
	for (const t of multiTenantData) {
		const [ins] = await db
			.insert(tenants)
			.values({ ...t, phoneNumber: PHONE })
			.returning({ id: tenants.id });
		newTenantIds.push(ins.id);
	}

	// Completed leases (riwayat lama)
	const multiCompleted = [
		// Ahmad: A-02 dulu, pindah ke D-01
		{
			ti: newTenantIds[0],
			r: "A-02",
			start: d(-18, 1),
			end: d(-12, 31),
		},
		// Dian: E-01 dulu, sewa ulang E-01 lagi
		{
			ti: newTenantIds[1],
			r: "E-01",
			start: d(-16, 1),
			end: d(-10, 31),
		},
		// Bayu: F-02 dulu, pindah ke B-02
		{
			ti: newTenantIds[2],
			r: "F-02",
			start: d(-14, 1),
			end: d(-8, 30),
		},
	];

	for (const l of multiCompleted)
		await db
			.insert(leases)
			.values({
				tenantId: l.ti,
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: false,
			})
			.run();

	// Active leases (kamar sekarang)
	const multiActive = [
		{ ti: newTenantIds[0], r: "D-01", start: d(-11, 1), end: null },
		{ ti: newTenantIds[1], r: "E-01", start: d(-9, 1), end: null },
		{ ti: newTenantIds[2], r: "B-02", start: d(-7, 1), end: null },
	];

	for (const l of multiActive)
		await db
			.insert(leases)
			.values({
				tenantId: l.ti,
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: true,
			})
			.run();

	console.log(
		"   Added 3 tenants (15 total): Ahmad (pindah A-02→D-01), Dian (sewa ulang E-01), Bayu (sewa baru F-02→B-02)",
	);

	// ── 6. More Multi-lease Tenants (3+ leases, sewa ulang kamar) ───
	console.log(
		"6/4 More multi-lease tenants (Rizky 3 leases, Citra sewa ulang)...",
	);

	const moreTenantData = [
		{ fullName: "Rizky Amalia", originRegion: "Bogor", isVerified: true },
		{ fullName: "Citra Kirana", originRegion: "Aceh", isVerified: true },
	];

	const moreTenantIds: number[] = [];
	for (const t of moreTenantData) {
		const [ins] = await db
			.insert(tenants)
			.values({ ...t, phoneNumber: PHONE })
			.returning({ id: tenants.id });
		moreTenantIds.push(ins.id);
	}

	// Completed leases (riwayat lama)
	const moreCompleted = [
		// Rizky: A-02 dulu, pindah ke F-02, lalu balik ke A-02
		{ ti: moreTenantIds[0], r: "A-02", start: d(-30, 1), end: d(-24, 31) },
		{ ti: moreTenantIds[0], r: "F-02", start: d(-22, 1), end: d(-16, 31) },
		// Citra: F-02 dulu, sewa ulang F-02 lagi setelah gap
		{ ti: moreTenantIds[1], r: "F-02", start: d(-14, 1), end: d(-8, 30) },
	];

	for (const l of moreCompleted)
		await db
			.insert(leases)
			.values({
				tenantId: l.ti,
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: false,
			})
			.run();

	// Active leases (kamar sekarang)
	const moreActive = [
		{ ti: moreTenantIds[0], r: "A-02", start: d(-14, 1), end: null },
		{ ti: moreTenantIds[1], r: "F-02", start: d(-6, 1), end: null },
	];

	for (const l of moreActive)
		await db
			.insert(leases)
			.values({
				tenantId: l.ti,
				roomId: rid(l.r),
				startDate: l.start,
				endDate: l.end,
				isActive: true,
			})
			.run();

	console.log(
		"   Added 2 more tenants (17 total): Rizky (A-02→F-02→A-02, 3 leases), Citra (F-02 sewa ulang)",
	);

	console.log("\n✅ Blackbox seed complete!");
	console.log(
		"   Next: run scheduler cron to generate invoices & reminders (see BLACKBOX.md).",
	);
};

main();
