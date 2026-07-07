import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { ConversationManager } from "../manager";
import type { FlowDef } from "../types";

const mockTenant = {
	id: 1,
	fullName: "Test",
	phoneNumber: "123",
	originRegion: "Jakarta",
	isVerified: true,
	lease: null,
};

const multiStepFlow: FlowDef = {
	name: "multi",
	initialStep: "step1",
	steps: {
		step1: () => ({ reply: "one", next: "step2" }),
		step2: () => ({ reply: "two", next: null }),
	},
};

const stayFlow: FlowDef = {
	name: "stay",
	initialStep: "stay",
	steps: { stay: () => ({ reply: "again", next: undefined }) },
};

let origDateNow: typeof Date.now;

beforeEach(() => {
	origDateNow = Date.now;
});

afterEach(() => {
	Date.now = origDateNow;
});

describe("ConversationManager", () => {
	describe("registerFlow / startSession", () => {
		it("registers flow and starts session", () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);
			m.startSession("jid1", mockTenant, "multi");
			expect(m.hasActiveSession("jid1")).toBe(true);
		});

		it("throws for unknown flow", () => {
			const m = new ConversationManager();
			expect(() => m.startSession("jid1", mockTenant, "unknown")).toThrow(
				"Flow 'unknown' not registered",
			);
		});
	});

	describe("hasActiveSession", () => {
		it("returns false for unknown JID", () => {
			const m = new ConversationManager();
			expect(m.hasActiveSession("nonexistent")).toBe(false);
		});

		it("returns false for expired session", () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);

			Date.now = () => 1000;
			m.startSession("jid1", mockTenant, "multi");

			Date.now = () => 1000 + 5 * 60 * 1000 + 1; // past 5 min timeout
			expect(m.hasActiveSession("jid1")).toBe(false);
		});

		it("ends expired session on check", () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);

			Date.now = () => 1000;
			m.startSession("jid1", mockTenant, "multi");

			Date.now = () => 1000 + 5 * 60 * 1000 + 1;
			m.hasActiveSession("jid1"); // triggers endSession

			expect(m.hasActiveSession("jid1")).toBe(false);
		});
	});

	describe("handleMessage", () => {
		it("returns null for JID with no session", async () => {
			const m = new ConversationManager();
			const result = await m.handleMessage("jid1", { text: "hi" });
			expect(result).toBeNull();
		});

		it("routes to step handler and returns reply", async () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);
			m.startSession("jid1", mockTenant, "multi");
			const result = await m.handleMessage("jid1", { text: "hi" });
			expect(result).toBe("one");
		});

		it("advances step when handler returns next string", async () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);
			m.startSession("jid1", mockTenant, "multi");

			await m.handleMessage("jid1", { text: "x" }); // step1 → step2
			const result = await m.handleMessage("jid1", { text: "x" }); // step2
			expect(result).toBe("two");
		});

		it("ends session when handler returns next: null", async () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);
			m.startSession("jid1", mockTenant, "multi");

			await m.handleMessage("jid1", { text: "x" }); // step1 → step2
			await m.handleMessage("jid1", { text: "x" }); // step2 → null

			expect(m.hasActiveSession("jid1")).toBe(false);
		});

		it("stays on same step when handler returns no next", async () => {
			const m = new ConversationManager();
			m.registerFlow(stayFlow);
			m.startSession("jid1", mockTenant, "stay");

			const r1 = await m.handleMessage("jid1", { text: "x" });
			expect(r1).toBe("again");

			const r2 = await m.handleMessage("jid1", { text: "x" });
			expect(r2).toBe("again"); // same handler called again
		});

		it("returns null for expired session", async () => {
			const m = new ConversationManager();
			m.registerFlow(multiStepFlow);

			Date.now = () => 1000;
			m.startSession("jid1", mockTenant, "multi");

			Date.now = () => 1000 + 5 * 60 * 1000 + 1;
			const result = await m.handleMessage("jid1", { text: "hi" });
			expect(result).toBeNull();
			expect(m.hasActiveSession("jid1")).toBe(false);
		});
	});
});
