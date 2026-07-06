import type { Tenant } from "@indekos/database/schema";

import { submitComplaintResponse } from "../lib/complaint";

export const submitComplaint = (
	tenant: Tenant,
	text: string,
	image?: { buffer: Buffer; mimetype: string },
): Promise<string> => submitComplaintResponse(tenant, text, image);
