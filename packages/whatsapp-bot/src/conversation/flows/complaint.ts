import { formatDate } from "@indekos/utilities/date";

import type { Logger } from "pino";

import type {
	ConversationSession,
	FlowDef,
	MessageInput,
} from "~/conversation/types";
import { createComplaint, notifyStaffNewComplaint } from "~/lib/complaint";
import { render } from "~/template";

const completeComplaint = async (
	session: ConversationSession,
	text: string,
	image?: MessageInput["image"],
	logger?: Logger,
) => {
	const log = logger?.child({ submodule: "conversation:complaint:complete" });

	if (!session.tenant.lease) {
		log?.info({ tenantId: session.tenant.id }, "no active lease for complaint");
		return {
			reply: render("no-lease-complaint", {}),
			next: null,
		};
	}

	const description = image ? text || "Foto" : text;

	if (!image && description.length < 5) {
		log?.debug(
			{
				tenantId: session.tenant.id,
				descriptionLength: description.length,
			},
			"complaint description too short",
		);
		return {
			reply:
				"✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan.",
		};
	}

	try {
		const complaint = await createComplaint(session.tenant, description, image);
		await notifyStaffNewComplaint(session.tenant, complaint);

		log?.info(
			{
				tenantId: session.tenant.id,
				complaintId: complaint.id,
				hasImage: !!image,
			},
			"complaint created and staff notified",
		);

		return {
			reply: render("submit-complaint", {
				id: complaint.id,
				description,
				createdAt: formatDate(complaint.createdAt),
			}),
			next: null,
		};
	} catch (error) {
		log?.error(
			{ error, tenantId: session.tenant.id },
			"failed to create complaint",
		);
		throw error;
	}
};

export const complaintFlow: FlowDef = {
	name: "complaint",
	initialStep: "prompt",
	steps: {
		prompt: async (input, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:complaint:prompt",
			});

			if (!session.tenant.lease) {
				log?.info(
					{ tenantId: session.tenant.id },
					"no active lease for complaint flow",
				);
				return {
					reply: render("no-lease-complaint", {}),
					next: null,
				};
			}

			const text = input.text.replace(/^komplain\s*/i, "").trim();
			const lower = text.toLowerCase();

			if (input.image || text) {
				if (lower === "batal") {
					log?.debug(
						{ tenantId: session.tenant.id },
						"complaint flow cancelled by user",
					);
					return { reply: "❌ Komplain dibatalkan.", next: null };
				}

				return completeComplaint(session, text, input.image, options?.logger);
			}

			return { reply: render("complaint-prompt", {}), next: "collect" };
		},

		collect: async (input: MessageInput, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:complaint:collect",
			});

			const text = input.text.trim();
			const lower = text.toLowerCase();

			if (lower === "batal") {
				log?.debug(
					{ tenantId: session.tenant.id },
					"complaint flow cancelled by user",
				);
				return { reply: "❌ Komplain dibatalkan.", next: null };
			}

			return completeComplaint(session, text, input.image, options?.logger);
		},
	},
};
