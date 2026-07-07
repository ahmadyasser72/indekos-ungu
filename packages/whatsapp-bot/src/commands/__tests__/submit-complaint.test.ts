import { db } from "@indekos/database";
import { tenants, users } from "@indekos/database/schema";

import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

import type { ActiveTenant } from "../../conversation/types";
import { submitComplaint } from "../submit-complaint";

const mockSendPush = mock(() => Promise.resolve({ sent: 0 }));

mock.module("@indekos/utilities/push", () => ({
	sendPush: mockSendPush,
}));

let testTenant: ActiveTenant;

beforeAll(async () => {
	db.run("BEGIN");

	await db.insert(users).values({
		username: "test-staff",
		displayName: "Test Staff",
		role: "staff",
		passwordHash: "x",
	});

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Submit Test",
			phoneNumber: "6281234567895",
		})
		.returning({ id: tenants.id });

	const dbTenant = await db.query.tenants.findFirst({
		where: { id: tenant.id },
	});
	testTenant = {
		...dbTenant!,
		lease: {
			room: {
				id: 1,
				roomNumber: "101",
				roomType: "standard",
				monthlyPrice: 1000000,
				isActive: true,
			},
		},
	};
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("submitComplaint", () => {
	it("inserts complaint and returns success message", async () => {
		const result = await submitComplaint(
			testTenant,
			"komplain AC kamar tidak dingin",
		);

		expect(result).toContain("Komplain Diterima");
		expect(result).toContain("AC kamar tidak dingin");

		// Verify complaint was actually inserted
		const allComplaints = await db.query.complaints.findMany({
			where: { tenantId: testTenant.id },
		});
		expect(allComplaints).toHaveLength(1);
		expect(allComplaints[0].description).toBe("AC kamar tidak dingin");
		expect(allComplaints[0].status).toBe("open");

		expect(mockSendPush).toHaveBeenCalledTimes(1);
	});

	it("returns help text when description too short", async () => {
		const result = await submitComplaint(testTenant, "komplain");

		expect(result).toContain("Ajukan Komplain");
		expect(result).toContain("format");
	});

	it("returns help text when empty after prefix", async () => {
		const result = await submitComplaint(testTenant, "komplain ");

		expect(result).toContain("Ajukan Komplain");
	});

	it("returns no-lease message when tenant has no active lease", async () => {
		const result = await submitComplaint(
			{
				id: 999,
				fullName: "No Lease",
				phoneNumber: "123",
				originRegion: null,
				isVerified: true,
				lease: null,
			},
			"komplain AC rusak",
		);

		expect(result).toContain("belum punya sewa kamar aktif");
	});

	it("does not insert complaint for invalid input", async () => {
		const before = await db.query.complaints.findMany({
			where: { tenantId: testTenant.id },
		});

		await submitComplaint(testTenant, "komplain");

		const after = await db.query.complaints.findMany({
			where: { tenantId: testTenant.id },
		});
		expect(after).toHaveLength(before.length);
	});
});
