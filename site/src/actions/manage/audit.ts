import { db, eq } from "@indekos/database";
import { auditDetail, auditLogs } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const remove = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
	}),
	handler: async ({ id }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:audit:remove",
		});
		const value = await db.query.auditLogs.findFirst({
			columns: { id: true, tableName: true, action: true, recordId: true },
			where: { id },
		});
		if (!value) {
			log.error({ auditLogId: id }, "audit log not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Audit log tidak ditemukan.",
			});
		}

		log.info({ auditLogId: id }, "attempting to delete audit log");

		await db.delete(auditLogs).where(eq(auditLogs.id, id));

		await context.locals.logAudit(
			"DELETE",
			"audit_logs",
			id,
			auditDetail.delete(`Menghapus audit log dengan ID: ${id}`, value),
		);

		log.info("audit log deleted");
		return { success: true, id };
	},
});
