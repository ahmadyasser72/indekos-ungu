import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import { db } from "@indekos/database";
import {
	leases,
	rooms,
	tenants,
	users,
	type User,
} from "@indekos/database/schema";

import { runInvoiceGeneration } from "../invoice-generation";

const mockGeneratePaymentLink = mock(() =>
	Promise.resolve({
		paymentUrl:
			"https://sandbox.duitku.com/redirect_checkout?reference=MOCK123",
		reference: "MOCK123",
		alreadyExists: false,
	}),
);

mock.module("@indekos/database/duitku/invoice-payment", () => ({
	generatePaymentLink: mockGeneratePaymentLink,
}));

let systemUser: User;
let leaseId: number;

beforeAll(async () => {
	process.env.SITE_URL = "http://localhost:4321";
	db.run("BEGIN");

	systemUser =
		(await db.query.users.findFirst({ where: { username: "system" } })) ??
		(
			await db
				.insert(users)
				.values({
					username: "system",
					passwordHash: "x",
					displayName: "System",
					role: "system",
				})
				.returning()
		)[0];

	const [room] = await db
		.insert(rooms)
		.values({
			roomNumber: "INV01",
			roomType: "standard",
			monthlyPrice: 250_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Invoice Test",
			phoneNumber: "6281234567898",
		})
		.returning({ id: tenants.id });

	const [lease] = await db
		.insert(leases)
		.values({
			tenantId: tenant.id,
			roomId: room.id,
			startDate: new Date("2026-01-15"),
			endDate: null,
			isActive: true,
		})
		.returning({ id: leases.id });

	leaseId = lease.id;
});

afterAll(() => {
	delete process.env.SITE_URL;
	db.run("ROLLBACK");
});

beforeEach(() => {
	mockGeneratePaymentLink.mockClear();
});

describe("runInvoiceGeneration", () => {
	it("creates invoice 7 days before next cycle start", async () => {
		// startDate Jan 15 → next cycle = Feb 15 → creation date = Feb 8
		await runInvoiceGeneration(systemUser, new Date("2026-02-08"));

		const invoice = await db.query.invoices.findFirst({
			where: { leaseId },
		});
		expect(invoice).not.toBeUndefined();
		expect(invoice!.amount).toBe(250_000);
		expect(invoice!.status).toBe("unpaid");

		expect(mockGeneratePaymentLink).toHaveBeenCalledTimes(1);
		expect(mockGeneratePaymentLink).toHaveBeenCalledWith(
			expect.any(Number),
			"http://localhost:4321",
			systemUser.id,
		);
	});

	it("does not create invoice on wrong day", async () => {
		const before = await db.query.invoices.findMany({ where: { leaseId } });

		await runInvoiceGeneration(systemUser, new Date("2026-02-09"));

		const after = await db.query.invoices.findMany({ where: { leaseId } });
		expect(after).toHaveLength(before.length);
	});

	it("does not create duplicate invoice for same period", async () => {
		await runInvoiceGeneration(systemUser, new Date("2026-02-08"));

		const all = await db.query.invoices.findMany({ where: { leaseId } });
		expect(all).toHaveLength(1);
	});

	it("creates next month invoice when date matches", async () => {
		// Feb 15 cycle → next cycle = Mar 15 → creation = Mar 8
		await runInvoiceGeneration(systemUser, new Date("2026-03-08"));

		const all = await db.query.invoices.findMany({ where: { leaseId } });
		expect(all.length).toBeGreaterThanOrEqual(2);
	});

	it("creates audit log", async () => {
		const audit = await db.query.auditLogs.findFirst({
			where: { action: "CREATE", tableName: "invoices" },
		});
		expect(audit).not.toBeUndefined();
		expect(audit!.details).toMatchObject({
			type: "cron",
			table: "invoices",
		});
	});
});

describe("runInvoiceGeneration — backfill", () => {
	let backfillLeaseId: number;

	beforeAll(async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "BK01",
				roomType: "premium",
				monthlyPrice: 350_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "Backfill Test",
				phoneNumber: "6281234567899",
			})
			.returning({ id: tenants.id });

		const [lease] = await db
			.insert(leases)
			.values({
				tenantId: tenant.id,
				roomId: room.id,
				startDate: new Date("2026-01-15"),
				endDate: null,
				isActive: true,
			})
			.returning({ id: leases.id });

		backfillLeaseId = lease.id;
	});

	it("backfills all missing invoices for old lease", async () => {
		// Lease started Jan 15, today is Jun 8 (5 months missing: Feb, Mar, Apr, May, Jun)
		await runInvoiceGeneration(systemUser, new Date("2026-06-08"));

		const all = await db.query.invoices.findMany({
			where: { leaseId: backfillLeaseId },
		});

		// Feb 15, Mar 15, Apr 15, May 15, Jun 15 — 5 invoices
		expect(all).toHaveLength(5);
		expect(all.every((inv) => inv.amount === 350_000)).toBe(true);
	});

	it("does not create invoices beyond lease end date", async () => {
		const [room] = await db
			.insert(rooms)
			.values({
				roomNumber: "BK02",
				roomType: "standard",
				monthlyPrice: 250_000,
				isActive: true,
			})
			.returning({ id: rooms.id });

		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "Backfill End Test",
				phoneNumber: "6281234567900",
			})
			.returning({ id: tenants.id });

		const [lease] = await db
			.insert(leases)
			.values({
				tenantId: tenant.id,
				roomId: room.id,
				startDate: new Date("2026-01-15"),
				endDate: new Date("2026-04-14"),
				isActive: true,
			})
			.returning({ id: leases.id });

		await runInvoiceGeneration(systemUser, new Date("2026-06-08"));

		const all = await db.query.invoices.findMany({
			where: { leaseId: lease.id },
		});

		// Feb 15, Mar 15, Apr 15 only (Apr 15 is NOT before endDate Apr 14)
		expect(all).toHaveLength(2);
	});
});
