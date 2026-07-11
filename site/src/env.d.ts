declare namespace App {
	interface SessionData {
		user: Pick<
			import("@indekos/database/schema").User,
			"id" | "role" | "lastAccessed"
		> & {
			name: string;
		};

		pushEndpoint: string;
	}

	interface Locals {
		parseQuery: <S extends import("astro/zod").ZodObject>(
			schema: S,
		) => import("astro/zod").output<S>;
		logAudit: (
			action: (typeof import("@indekos/database/schema").AUDIT_ACTIONS)[number],
			tableName: string,
			recordId: number | null,
			details: import("@indekos/database/schema").AuditDetails,
		) => Promise<void>;

		user?: SessionData["user"] & { allowEdit?: boolean; allowChat?: boolean };

		logger: import("@indekos/utilities/logger").Logger;
		actionResults: import("~/lib/form-result").ActionResult[];
	}
}
