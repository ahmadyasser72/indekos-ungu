import { db } from "@e-kos/database";
import {
	invoices,
	leases,
	rooms,
	tenants,
	type Tenant,
} from "@e-kos/database/schema";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { checkBills } from "../check-bills";

let testTenant: Tenant;

beforeAll(async () => {
	db.run("BEGIN");

	const [room] = await db
		.insert(rooms)
		.values({
			roomNumber: "TST02",
			roomType: "premium",
			monthlyPrice: 500_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Bills Test",
			phoneNumber: "6281234567891",
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

	// Unpaid invoice
	await db.insert(invoices).values({
		leaseId: lease.id,
		amount: 500_000,
		dueDate: new Date("2026-06-10"),
		status: "unpaid",
	});

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
	}))!;
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("checkBills", () => {
	it("reports unpaid bills", async () => {
		const result = await checkBills(testTenant);
		expect(result).toContain("500");
		expect(result).toContain("TST02");
		expect(result).toContain("1 tagihan");
	});

	it("shows invoice creation date", async () => {
		const result = await checkBills(testTenant);
		expect(result).toContain("Dibuat:");
	});

	it("does not say all paid when unpaid exist", async () => {
		const result = await checkBills(testTenant);
		expect(result).not.toContain("Semua pembayaran lunas");
	});
});

describe("checkBills no lease", () => {
	let tenantNoLease: Tenant;

	beforeAll(async () => {
		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "No Lease",
				phoneNumber: "6281234567899",
			})
			.returning({ id: tenants.id });

		tenantNoLease = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("returns no active lease message", async () => {
		const result = await checkBills(tenantNoLease);
		expect(result).toBe("📍 Anda tidak memiliki kontrak sewa yang aktif.");
	});
});

describe("checkBills all paid", () => {
	let tenantAllPaid: Tenant;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "TST04",
				roomType: "standard",
				monthlyPrice: 300_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "All Paid",
				phoneNumber: "6281234567898",
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

		// Only paid invoices, no unpaid
		await db.insert(invoices).values({
			leaseId: lease.id,
			amount: 300_000,
			dueDate: new Date("2026-01-10"),
			paidAt: new Date("2026-01-11"),
			status: "paid",
		});

		tenantAllPaid = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("shows all paid message", async () => {
		const result = await checkBills(tenantAllPaid);
		expect(result).toContain("Semua pembayaran lunas");
	});

	it("does not ask to contact admin", async () => {
		const result = await checkBills(tenantAllPaid);
		expect(result).not.toContain("Silakan hubungi admin");
	});
});

describe("checkBills with payment link", () => {
	let tenantWithLink: Tenant;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "TST05",
				roomType: "premium",
				monthlyPrice: 400_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "Link Test",
				phoneNumber: "6281234567897",
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
			amount: 400_000,
			dueDate: new Date("2026-06-10"),
			status: "unpaid",
			duitkuReference: "REF-TEST-001",
		});

		tenantWithLink = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("shows payment URL when duitkuReference exists", async () => {
		const result = await checkBills(tenantWithLink);
		expect(result).toContain("Bayar:");
		expect(result).toContain("REF-TEST-001");
	});
});
