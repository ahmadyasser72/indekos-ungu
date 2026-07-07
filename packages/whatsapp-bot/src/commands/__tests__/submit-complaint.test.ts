import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { db } from "@indekos/database";
import { tenants, type Tenant } from "@indekos/database/schema";

import { submitComplaint } from "../submit-complaint";

const mockSendPush = mock(() => Promise.resolve({ sent: 0 }));

mock.module("@indekos/utilities/push", () => ({
	sendPush: mockSendPush,
}));

let testTenant: Tenant;

beforeAll(async () => {
	db.run("BEGIN");

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "Submit Test",
			phoneNumber: "6281234567895",
		})
		.returning({ id: tenants.id });

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
	}))!;
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
