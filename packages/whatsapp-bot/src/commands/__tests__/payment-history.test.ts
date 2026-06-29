import { db } from "@e-kos/database";
import {
	invoices,
	leases,
	rooms,
	tenants,
	type Tenant,
} from "@e-kos/database/schema";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { paymentHistory } from "../payment-history";

let testTenant: Tenant;

beforeAll(async () => {
	db.run("BEGIN");

	const [room] = await db
		.insert(rooms)
		.values({
			roomNumber: "TST03",
			roomType: "standard",
			monthlyPrice: 250_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "History Test",
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

	// Past paid invoices
	await db.insert(invoices).values([
		{
			leaseId: lease.id,
			amount: 250_000,
			dueDate: new Date("2026-01-10"),
			paidAt: new Date("2026-01-12"),
			status: "paid",
		},
		{
			leaseId: lease.id,
			amount: 250_000,
			dueDate: new Date("2026-02-10"),
			paidAt: new Date("2026-02-11"),
			status: "paid",
		},
	]);

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
	}))!;
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("paymentHistory", () => {
	it("returns paid invoices list", async () => {
		const result = await paymentHistory(testTenant);
		expect(result).toContain("250");
		expect(result).toContain("2");
	});

	it("does not say no history when invoices exist", async () => {
		const result = await paymentHistory(testTenant);
		expect(result).not.toContain("tidak memiliki riwayat");
	});
});

describe("paymentHistory no lease", () => {
	let tenantNoLease: Tenant;

	beforeAll(async () => {
		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "No Lease History",
				phoneNumber: "628123456789A",
			})
			.returning({ id: tenants.id });

		tenantNoLease = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("returns no payment history for tenant without lease", async () => {
		const result = await paymentHistory(tenantNoLease);
		expect(result).toBe("Anda tidak memiliki riwayat pembayaran.");
	});
});

describe("paymentHistory no paid invoices", () => {
	let tenantNoPaid: Tenant;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "TST06",
				roomType: "standard",
				monthlyPrice: 200_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "Unpaid Only",
				phoneNumber: "628123456789B",
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

		// Only unpaid invoices
		await db.insert(invoices).values({
			leaseId: lease.id,
			amount: 200_000,
			dueDate: new Date("2026-06-10"),
			status: "unpaid",
		});

		tenantNoPaid = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
		}))!;
	});

	it("returns no paid invoices message", async () => {
		const result = await paymentHistory(tenantNoPaid);
		expect(result).toBe("Belum ada riwayat pembayaran lunas.");
	});
});
