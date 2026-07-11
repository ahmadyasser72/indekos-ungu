import { db } from "@indekos/database";
import { auditDetail, chatbotMessages } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const sendMessage = defineAction({
	accept: "form",
	input: z.object({
		tenantId: z.coerce.number(),
		message: z.string().trim().nonempty("Pesan tidak boleh kosong"),
	}),
	handler: async ({ tenantId, message }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:tenant-chat:sendMessage",
		});

		const user = context.locals.user;
		if (!user?.allowChat) {
			log.warn({ userId: user?.id }, "user lacks chat permission");
			throw new ActionError({
				code: "FORBIDDEN",
				message: "Anda tidak memiliki izin untuk mengirim pesan.",
			});
		}

		const tenant = await db.query.tenants.findFirst({
			columns: { id: true, fullName: true },
			where: { id: tenantId },
		});

		if (!tenant) {
			log.error({ tenantId }, "tenant not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Penghuni tidak ditemukan.",
			});
		}

		log.info({ tenantId }, "attempting to send message to tenant");

		const [inserted] = await db
			.insert(chatbotMessages)
			.values({
				tenantId,
				staffId: user.id,
				message,
				direction: "outgoing",
				status: "pending",
			})
			.returning();

		await context.locals.logAudit(
			"CREATE",
			"chatbot_messages",
			inserted.id,
			auditDetail.create(
				`Mengirim pesan ke penghuni: ${tenant.fullName}`,
				inserted,
			),
		);

		log.info({ messageId: inserted.id }, "message queued for sending");
		return { success: true };
	},
});
