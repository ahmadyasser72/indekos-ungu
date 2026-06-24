import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@e-kos/database";
import {
	invoices,
	leases,
	rooms,
	tenants,
	users,
} from "@e-kos/database/schema";

import { runRentReminder } from "../rent-reminder";

let systemUser: typeof users.$inferSelect;
let tenantId: number;

beforeAll(async () => {
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
			roomNumber: "REM01",
			roomType: "standard",
			monthlyPrice: 250_000,
			isActive: true,
		})
		.returning({ id: rooms.id });

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Reminder Test",
			phoneNumber: "6281234567897",
		})
		.returning({ id: tenants.id });

	tenantId = tenant.id;

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

	// Invoice due within 3 days from ref date
	await db.insert(invoices).values({
		leaseId: lease.id,
		amount: 250_000,
		dueDate: new Date("2026-06-12"), // 3 days from June 9
		status: "unpaid",
	});
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("runRentReminder", () => {
	it("creates notification for upcoming due invoice", async () => {
		await runRentReminder(systemUser, new Date("2026-06-09"));

		const notif = await db.query.notifications.findFirst({
			where: { tenantId, type: "reminder" },
		});
		expect(notif).not.toBeUndefined();
		expect(notif!.status).toBe("pending");
	});

	it("does not create notification for invoice outside 3-day window", async () => {
		// Due June 12, check on June 1 (11 days away)
		const before = await db.query.notifications.findMany({
			where: { tenantId, type: "reminder" },
		});

		await runRentReminder(systemUser, new Date("2026-06-01"));

		const after = await db.query.notifications.findMany({
			where: { tenantId, type: "reminder" },
		});
		expect(after).toHaveLength(before.length);
	});

	it("creates audit log for reminders", async () => {
		await runRentReminder(systemUser, new Date("2026-06-09"));

		const audit = await db.query.auditLogs.findFirst({
			where: { action: "CREATE", tableName: "notifications" },
		});
		expect(audit).not.toBeUndefined();
		expect(audit!.details).toMatchObject({
			type: "cron",
			table: "notifications",
		});
	});
});
