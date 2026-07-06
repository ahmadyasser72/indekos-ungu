import { formatDate } from "@indekos/utilities/date";

import { createComplaint, notifyStaffNewComplaint } from "../../lib/complaint";
import { render } from "../../template";
import type { FlowDef, MessageInput } from "../types";

export const komplainFlow: FlowDef = {
	name: "komplain",
	initialStep: "prompt",
	steps: {
		prompt: async () => ({
			reply: render("complaint-prompt", {}),
			next: "collect",
		}),

		collect: async (input: MessageInput, session) => {
			const text = input.text.trim();
			const lower = text.toLowerCase();

			if (lower === "batal") {
				return {
					reply: "❌ Komplain dibatalkan.",
					next: null,
				};
			}

			// Use caption or placeholder if image without text
			const description = input.image ? text || "Foto" : text;

			if (!input.image && description.length < 5) {
				return {
					reply:
						"✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan.",
				};
			}

			const complaint = await createComplaint(
				session.tenant,
				description,
				input.image,
			);

			await notifyStaffNewComplaint(
				session.tenant,
				description,
				input.image,
				complaint.imagePath,
			);

			return {
				reply: render("submit-complaint", {
					id: complaint.id,
					description,
					createdAt: formatDate(complaint.createdAt),
				}),
				next: null,
			};
		},
	},
};
