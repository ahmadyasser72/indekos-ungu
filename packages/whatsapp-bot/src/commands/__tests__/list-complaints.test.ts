import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@indekos/database";
import { complaints, tenants } from "@indekos/database/schema";

import type { ConversationSession } from "~/conversation/types";
import { listComplaints } from "../list-complaints";

let testTenant: ConversationSession["tenant"];

beforeAll(async () => {
	db.run("BEGIN");

	const [tenant] = await db
		.insert(tenants)
		.values({
			fullName: "List Complaint Test",
			phoneNumber: "6281234567894",
		})
		.returning({ id: tenants.id });

	// Insert 2 complaints for this tenant
	await db.insert(complaints).values([
		{
			tenantId: tenant.id,
			description: "Lampu kamar mati",
			status: "open",
		},
		{
			tenantId: tenant.id,
			description: "Kran wastafel bocor",
			status: "in_progress",
		},
	]);

	testTenant = (await db.query.tenants.findFirst({
		where: { id: tenant.id },
		with: { lease: { columns: {}, with: { room: true } } },
	}))!;
});

afterAll(() => {
	db.run("ROLLBACK");
});

describe("listComplaints", () => {
	it("returns list of complaints", async () => {
		const result = await listComplaints(testTenant);
		expect(result).toContain("Lampu kamar mati");
		expect(result).toContain("Kran wastafel bocor");
		expect(result).toContain("Menunggu");
		expect(result).toContain("Diproses");
	});

	it("includes hint to see detail", async () => {
		const result = await listComplaints(testTenant);
		expect(result).toMatch(/komplainku \d+/);
	});
});

describe("listComplaints no complaints", () => {
	let tenantNoComplaints: ConversationSession["tenant"];

	beforeAll(async () => {
		const [tenant] = await db
			.insert(tenants)
			.values({
				fullName: "No Complaints",
				phoneNumber: "62812345678" + Math.random().toString().slice(2),
			})
			.returning({ id: tenants.id });

		tenantNoComplaints = (await db.query.tenants.findFirst({
			where: { id: tenant.id },
			with: { lease: { columns: {}, with: { room: true } } },
		}))!;
	});

	it("returns no complaints message", async () => {
		const result = await listComplaints(tenantNoComplaints);
		expect(result).toBe("Belum ada komplain yang Anda kirimkan.");
	});
});
