declare namespace App {
	interface SessionData {
		user: {
			id: number;
			name: string;
			role: import("@e-kos/database/schema").User["role"];
		};
	}

	interface Locals {
		parseQuery: <S extends import("astro/zod").ZodObject>(
			schema: S,
		) => import("astro/zod").output<S>;
		logAudit: (
			action: (typeof import("@e-kos/database/schema").AUDIT_ACTIONS)[number],
			tableName: string,
			recordId: number | null,
			details: import("@e-kos/database/schema").AuditDetails,
		) => Promise<void>;
		user?: SessionData["user"] & { allowEdit?: boolean };
	}
}
