import { db } from "@e-kos/database";
import {
	complaints,
	tenants,
	users,
	type Tenant,
} from "@e-kos/database/schema";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { checkComplaint } from "../check-complaint";

let testTenant: Tenant;
let complaintId: number;

beforeAll(async () => {
	db.run("BEGIN");

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Complaint Test",
			phoneNumber: "6281234567892",
		})
		.returning({ id: tenants.id });

	const [complaint] = await db
		.insert(complaints)
		.values({
			tenantId: tenant.id,
			description: "AC kamar tidak dingin",
			status: "open",
		})
		.returning({ id: complaints.id });

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
	}))!;
	complaintId = complaint.id;
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("checkComplaint", () => {
	it("returns complaint details for valid id", async () => {
		const result = await checkComplaint(testTenant, complaintId);
		expect(result).toContain(`#${complaintId}`);
		expect(result).toContain("AC kamar tidak dingin");
		expect(result).toContain("Menunggu ditangani");
	});

	it("does not show timestamps for unprocessed complaint", async () => {
		const result = await checkComplaint(testTenant, complaintId);
		expect(result).not.toContain("Diproses:");
		expect(result).not.toContain("Diselesaikan:");
	});

	it("returns not found for invalid id", async () => {
		const result = await checkComplaint(testTenant, 99999);
		expect(result).toBe("Komplain dengan ID tersebut tidak ditemukan.");
	});

	it("shows processed and resolved timestamps when present", async () => {
		const resolved = await db
			.insert(complaints)
			.values({
				tenantId: testTenant.id,
				description: "Kran bocor",
				status: "resolved",
				processedAt: new Date("2026-06-20"),
				resolvedAt: new Date("2026-06-21"),
				resolveNotes: "Sudah diperbaiki",
			})
			.returning({ id: complaints.id });

		const result = await checkComplaint(testTenant, resolved[0].id);
		expect(result).toContain("Selesai");
		expect(result).toContain("Diproses:");
		expect(result).toContain("Diselesaikan:");
		expect(result).toContain("Sudah diperbaiki");
	});

	it("shows Diproses for in_progress status", async () => {
		const inProgress = await db
			.insert(complaints)
			.values({
				tenantId: testTenant.id,
				description: "Toilet mampet",
				status: "in_progress",
				processedAt: new Date("2026-06-22"),
			})
			.returning({ id: complaints.id });

		const result = await checkComplaint(testTenant, inProgress[0].id);
		expect(result).toContain("Diproses");
		expect(result).toContain("Diproses: 22 Jun 2026");
		expect(result).not.toContain("Diselesaikan:");
	});

	it("shows resolver name when resolved by user", async () => {
		const [user] = await db
			.insert(users)
			.values({
				username: "admin_test",
				passwordHash: "dummy_hash",
				displayName: "Admin Tester",
				role: "admin",
			})
			.returning({ id: users.id });

		const resolved = await db
			.insert(complaints)
			.values({
				tenantId: testTenant.id,
				description: "Pintu rusak",
				status: "resolved",
				processedAt: new Date("2026-06-20"),
				resolvedAt: new Date("2026-06-21"),
				resolvedBy: user.id,
				resolveNotes: "Engsel diganti",
			})
			.returning({ id: complaints.id });

		const result = await checkComplaint(testTenant, resolved[0].id);
		expect(result).toContain("Admin Tester");
		expect(result).toContain("Engsel diganti");
	});
});
