import { db } from "@e-kos/database";
import {
	invoices,
	leases,
	rooms,
	tenants,
	type Tenant,
} from "@e-kos/database/schema";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { tenantInfo } from "../tenant-info";

let testTenant: Tenant;

beforeAll(async () => {
	db.run("BEGIN");

	const [room] = await db
		.insert(rooms)
		.values({
			roomNumber: "TST01",
			roomType: "standard",
			monthlyPrice: 200_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Test User",
			phoneNumber: "6281234567890",
			originRegion: "Test City",
		})
		.returning({ id: tenants.id });

	await db.insert(leases).values({
		tenantId: tenant.id,
		roomId: room.id,
		startDate: new Date("2026-01-01"),
		endDate: null,
		isActive: true,
	});

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
	}))!;
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("tenantInfo", () => {
	it("returns tenant name and room details", async () => {
		const result = await tenantInfo(testTenant);
		expect(result).toContain("Test User");
		expect(result).toContain("TST01");
		expect(result).toContain("Rp 200");
		expect(result).toContain("standard");
		expect(result).toContain("Rp");
	});

	it("includes start date", async () => {
		const result = await tenantInfo(testTenant);
		expect(result).toContain("01 Jan 2026");
	});

	it("shows active lease message for null endDate", async () => {
		const result = await tenantInfo(testTenant);
		expect(result).toContain("Berlangsung");
	});

	it("shows all paid status when no unpaid invoices", async () => {
		const result = await tenantInfo(testTenant);
		expect(result).toContain("Tagihan Anda sudah lunas");
	});
});

describe("tenantInfo with unpaid invoices", () => {
	let tenantWithBills: Tenant;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "TST03",
				roomType: "premium",
				monthlyPrice: 500_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "Unpaid Tenant",
				phoneNumber: "6281234567893",
			})
			.returning({ id: tenants.id });

		const [lease] = await db
			.insert(leases)
			.values({
				tenantId: tenant.id,
				roomId: room.id,
				startDate: new Date("2026-01-01"),
				endDate: null,
				isActive: true,
			})
			.returning({ id: leases.id });

		await db.insert(invoices).values({
			leaseId: lease.id,
			amount: 500_000,
			dueDate: new Date("2026-06-10"),
			status: "unpaid",
		});

		tenantWithBills = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("shows unpaid warning with tagihan instruction", async () => {
		const result = await tenantInfo(tenantWithBills);
		expect(result).toContain("tagihan yang belum lunas");
		expect(result).toContain("Ketik *tagihan*");
	});
});

describe("tenantInfo no lease", () => {
	let tenantNoLease: Tenant;

	beforeAll(async () => {
		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "No Lease Info",
				phoneNumber: "628123456789C",
			})
			.returning({ id: tenants.id });

		tenantNoLease = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("returns no active lease message", async () => {
		const result = await tenantInfo(tenantNoLease);
		expect(result).toBe("Anda tidak memiliki kontrak sewa yang aktif.");
	});
});

describe("tenantInfo with end date", () => {
	let tenantWithEnd: Tenant;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "TST07",
				roomType: "standard",
				monthlyPrice: 250_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "End Date Tenant",
				phoneNumber: "628123456789D",
			})
			.returning({ id: tenants.id });

		await db.insert(leases).values({
			tenantId: tenant.id,
			roomId: room.id,
			startDate: new Date("2026-01-01"),
			endDate: new Date("2026-06-30"),
			isActive: true,
		});

		tenantWithEnd = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("shows end date instead of Berlangsung", async () => {
		const result = await tenantInfo(tenantWithEnd);
		expect(result).toContain("30 Jun 2026");
		expect(result).not.toContain("Berlangsung");
	});
});
