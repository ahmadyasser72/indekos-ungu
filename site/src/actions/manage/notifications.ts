import { db } from "@e-kos/database";
import { auditDetail, notifications } from "@e-kos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const send = defineAction({
	accept: "form",
	input: z.object({
		tenant_id: z.coerce.number(),
		message: z.string().min(1, "Pesan tidak boleh kosong"),
	}),
	handler: async ({ tenant_id, message }, context) => {
		const tenantExists = await db.query.tenants.findFirst({
			columns: { id: true },
			where: { id: tenant_id },
		});
		if (!tenantExists) {
			console.error("notifications.send: tenant not found", {
				tenant_id,
			});
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Penghuni tidak ditemukan.",
			});
		}

		const [inserted] = await db
			.insert(notifications)
			.values({
				tenantId: tenant_id,
				type: "custom",
				status: "sent",
			})
			.returning({ id: notifications.id });

		await context.locals.logAudit(
			"CREATE",
			"notifications",
			inserted.id,
			auditDetail.notification(
				`Mengirim notifikasi khusus ke tenant ID ${tenant_id}: ${message}`,
				"admin_panel",
				tenant_id,
			),
		);

		return inserted;
	},
});
