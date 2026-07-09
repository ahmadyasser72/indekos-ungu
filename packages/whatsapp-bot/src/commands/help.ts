import type { Tenant } from "@indekos/database/schema";

import type { Logger } from "pino";

import { render } from "~/template";

export const help = (tenant: Tenant, options?: { logger?: Logger }): string => {
	const log = options?.logger?.child({ submodule: "commands:help" });

	log?.debug({ tenantId: tenant.id }, "rendering help message");

	return render("help", { fullName: tenant.fullName });
};
