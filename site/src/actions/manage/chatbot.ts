import { db, eq } from "@indekos/database";
import { auditDetail, chatbotMessages } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const remove = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
	}),
	handler: async ({ id }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:chatbot:remove",
		});
		const value = await db.query.chatbotMessages.findFirst({ where: { id } });
		if (!value) {
			log.error({ messageId: id }, "chatbot message not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Pesan chatbot tidak ditemukan.",
			});
		}

		log.info({ messageId: id }, "attempting to delete chatbot message");

		await db.delete(chatbotMessages).where(eq(chatbotMessages.id, id));

		await context.locals.logAudit(
			"DELETE",
			"chatbot_messages",
			id,
			auditDetail.delete(`Menghapus log pesan chatbot dengan ID: ${id}`, value),
		);

		log.info("chatbot message deleted");
		return { success: true, id };
	},
});
