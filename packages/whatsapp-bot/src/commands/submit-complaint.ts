import type { ConversationSession } from "../conversation/types";
import { submitComplaintResponse } from "../lib/complaint";
import { render } from "../template";

export const submitComplaint = async (
	tenant: ConversationSession["tenant"],
	text: string,
	image?: { buffer: Buffer; mimetype: string },
): Promise<string> => {
	if (!tenant.lease) return render("no-lease-complaint", {});

	return submitComplaintResponse(tenant, text, image);
};
