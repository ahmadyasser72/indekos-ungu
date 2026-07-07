import { beforeEach, describe, expect, it, mock } from "bun:test";

import { complaintFlow } from "../../flows/complaint";
import type { ConversationSession, MessageInput } from "../../types";

const mockCreateComplaint = mock(
	async (_tenant: any, _description: string, _image?: any) => ({
		id: 1,
		createdAt: new Date("2025-06-01"),
	}),
);
const mockNotifyStaff = mock(async () => {});
const mockRender = mock(
	(template: string, _data?: any) => `rendered:${template}`,
);

mock.module("../../../lib/complaint", () => ({
	createComplaint: mockCreateComplaint,
	notifyStaffNewComplaint: mockNotifyStaff,
}));

mock.module("../../../template", () => ({
	render: mockRender,
}));

const makeSession = (
	overrides?: Partial<ConversationSession>,
): ConversationSession => ({
	jid: "test-jid",
	tenant: {
		id: 1,
		fullName: "Test",
		phoneNumber: "123",
		originRegion: "Jakarta",
		isVerified: true,
		lease: {
			room: {
				id: 1,
				roomNumber: "101",
				roomType: "standard",
				monthlyPrice: 1000000,
				isActive: true,
			},
		},
	},
	flow: "komplain",
	step: "prompt",
	lastActivity: Date.now(),
	data: {},
	...overrides,
});

const text = (t: string): MessageInput => ({ text: t });
const withImage = (txt = ""): MessageInput => ({
	text: txt,
	image: { buffer: Buffer.from("x"), mimetype: "image/jpeg" },
});

describe("komplainFlow", () => {
	beforeEach(() => {
		mockCreateComplaint.mockClear();
		mockNotifyStaff.mockClear();
		mockRender.mockClear();
	});

	describe("prompt step", () => {
		it('cancels on "batal"', async () => {
			const session = makeSession();
			const result = await complaintFlow.steps.prompt(text("batal"), session);

			expect(result.reply).toBe("❌ Komplain dibatalkan.");
			expect(result.next).toBeNull();
			expect(mockCreateComplaint).not.toHaveBeenCalled();
		});

		it('cancels on "komplain batal" (strips prefix)', async () => {
			const session = makeSession();
			const result = await complaintFlow.steps.prompt(
				text("komplain batal"),
				session,
			);

			expect(result.reply).toBe("❌ Komplain dibatalkan.");
			expect(result.next).toBeNull();
		});

		it("processes complaint when image provided without text", async () => {
			const session = makeSession();
			const result = await complaintFlow.steps.prompt(withImage(), session);

			expect(mockCreateComplaint).toHaveBeenCalledWith(
				session.tenant,
				"Foto",
				expect.objectContaining({ mimetype: "image/jpeg" }),
			);
			expect(result.reply).toBe("rendered:submit-complaint");
			expect(result.next).toBeNull();
		});

		it("processes complaint when text provided", async () => {
			const session = makeSession();
			const result = await complaintFlow.steps.prompt(
				text("AC rusak"),
				session,
			);

			expect(mockCreateComplaint).toHaveBeenCalledWith(
				session.tenant,
				"AC rusak",
				undefined,
			);
			expect(result.reply).toBe("rendered:submit-complaint");
			expect(result.next).toBeNull();
		});

		it("strips 'komplain ' prefix from text", async () => {
			const session = makeSession();
			await complaintFlow.steps.prompt(text("komplain AC rusak"), session);

			expect(mockCreateComplaint).toHaveBeenCalledWith(
				session.tenant,
				"AC rusak",
				undefined,
			);
		});

		it("returns no-lease message when tenant has no active lease", async () => {
			const session = makeSession({
				tenant: {
					id: 1,
					fullName: "Test",
					phoneNumber: "123",
					originRegion: "Jakarta",
					isVerified: true,
					lease: null,
				},
			});
			const result = await complaintFlow.steps.prompt(
				text("komplain AC rusak"),
				session,
			);

			expect(result.reply).toContain("no-lease-complaint");
			expect(result.next).toBeNull();
			expect(mockCreateComplaint).not.toHaveBeenCalled();
		});

		it("transitions to collect step when no text and no image", async () => {
			const session = makeSession();
			const result = await complaintFlow.steps.prompt(text(""), session);

			expect(result.reply).toBe("rendered:complaint-prompt");
			expect(result.next).toBe("collect");
			expect(mockCreateComplaint).not.toHaveBeenCalled();
		});
	});

	describe("collect step", () => {
		it('cancels on "batal"', async () => {
			const session = makeSession({ step: "collect" });
			const result = await complaintFlow.steps.collect(text("batal"), session);

			expect(result.reply).toBe("❌ Komplain dibatalkan.");
			expect(result.next).toBeNull();
		});

		it("returns no-lease message when tenant has no active lease", async () => {
			const session = makeSession({
				step: "collect",
				tenant: {
					id: 1,
					fullName: "Test",
					phoneNumber: "123",
					originRegion: "Jakarta",
					isVerified: true,
					lease: null,
				},
			});
			const result = await complaintFlow.steps.collect(
				text("AC rusak"),
				session,
			);

			expect(result.reply).toContain("no-lease-complaint");
			expect(result.next).toBeNull();
			expect(mockCreateComplaint).not.toHaveBeenCalled();
		});

		it("validates minimum text length when no image", async () => {
			const session = makeSession({ step: "collect" });
			const result = await complaintFlow.steps.collect(text("ab"), session);

			expect(result.reply).toContain("min 5 karakter");
			expect(result.next).toBeNull();
		});

		it("processes complaint with valid text and notifies staff", async () => {
			const session = makeSession({ step: "collect" });
			const result = await complaintFlow.steps.collect(
				text("AC kamar tidak dingin"),
				session,
			);

			expect(mockCreateComplaint).toHaveBeenCalledWith(
				session.tenant,
				"AC kamar tidak dingin",
				undefined,
			);
			expect(mockNotifyStaff).toHaveBeenCalledTimes(1);
			expect(result.reply).toBe("rendered:submit-complaint");
			expect(result.next).toBeNull();
		});
	});
});
