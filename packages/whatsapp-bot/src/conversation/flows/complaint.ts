import { formatDate } from "@indekos/utilities/date";

import { createComplaint, notifyStaffNewComplaint } from "../../lib/complaint";
import { render } from "../../template";
import type { ConversationSession, FlowDef, MessageInput } from "../types";

const completeComplaint = async (
	session: ConversationSession,
	text: string,
	image?: MessageInput["image"],
) => {
	if (!session.tenant.lease) {
		return {
			reply: render("no-lease-complaint", {}),
			next: null,
		};
	}

	const description = image ? text || "Foto" : text;

	if (!image && description.length < 5) {
		return {
			reply:
				"✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan.",
		};
	}

	const complaint = await createComplaint(session.tenant, description, image);
	await notifyStaffNewComplaint(session.tenant, complaint);

	return {
		reply: render("submit-complaint", {
			id: complaint.id,
			description,
			createdAt: formatDate(complaint.createdAt),
		}),
		next: null,
	};
};

export const complaintFlow: FlowDef = {
	name: "complaint",
	initialStep: "prompt",
	steps: {
		prompt: async (input, session) => {
			if (!session.tenant.lease) {
				return {
					reply: render("no-lease-complaint", {}),
					next: null,
				};
			}

			const text = input.text.replace(/^komplain\s*/i, "").trim();
			const lower = text.toLowerCase();

			if (input.image || text) {
				if (lower === "batal") {
					return { reply: "❌ Komplain dibatalkan.", next: null };
				}

				return completeComplaint(session, text, input.image);
			}

			return { reply: render("complaint-prompt", {}), next: "collect" };
		},

		collect: async (input: MessageInput, session) => {
			const text = input.text.trim();
			const lower = text.toLowerCase();

			if (lower === "batal") {
				return { reply: "❌ Komplain dibatalkan.", next: null };
			}

			return completeComplaint(session, text, input.image);
		},
	},
};
