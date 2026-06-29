import { db, eq } from "@e-kos/database";
import {
	invoices,
	leases,
	rooms,
	tenants,
	users,
	type User,
} from "@e-kos/database/schema";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { runOverdueCheck } from "../overdue";

let systemUser: User;
let leaseId: number;

beforeAll(async () => {
	db.run("BEGIN");

	// system user should exist from seed; if not, create one
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
			roomNumber: "OVD01",
			roomType: "standard",
			monthlyPrice: 300_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Overdue Test",
			phoneNumber: "6281234567896",
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

	leaseId = lease.id;

	// Past-due unpaid invoice (due in March)
	await db.insert(invoices).values({
		leaseId: lease.id,
		amount: 300_000,
		dueDate: new Date("2026-03-10"),
		status: "unpaid",
	});
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("runOverdueCheck", () => {
	it("marks past-due invoices as overdue", async () => {
		// Run check with 'now' after due date
		await runOverdueCheck(systemUser, new Date("2026-06-01"));

		const updated = await db.query.invoices.findFirst({
			where: { leaseId },
		});
		expect(updated?.status).toBe("overdue");
	});

	it("does not change invoices due in the future", async () => {
		// Reset status to unpaid (still within transaction)
		await db
			.update(invoices)
			.set({ status: "unpaid" })
			.where(eq(invoices.leaseId, leaseId));

		// Run with 'now' before due date
		await runOverdueCheck(systemUser, new Date("2026-01-01"));

		const updated = await db.query.invoices.findFirst({
			where: { leaseId },
		});
		expect(updated?.status).toBe("unpaid");
	});

	it("creates audit log entry when marking overdue", async () => {
		await db
			.update(invoices)
			.set({ status: "unpaid" })
			.where(eq(invoices.leaseId, leaseId));
		await runOverdueCheck(systemUser, new Date("2026-06-01"));

		const audit = await db.query.auditLogs.findFirst({
			where: { action: "UPDATE", tableName: "invoices" },
		});
		expect(audit).not.toBeUndefined();
		expect(audit!.details).toMatchObject({
			type: "cron",
			table: "invoices",
		});
	});
});
