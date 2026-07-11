import { db, eq } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
} from "@indekos/database/schema";
import type { Logger } from "@indekos/utilities/logger";
import { truncate } from "@indekos/utilities/transforms";

import type { WASocket } from "baileys";
import { omit } from "es-toolkit";

export const pollPendingMessages = async (
	sock: WASocket,
	botUserId: number,
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "polls:pending-messages",
	});

	log?.debug("polling for pending manual messages");
	try {
		const pending = await db.query.chatbotMessages.findMany({
			where: {
				status: "pending",
				direction: "outgoing",
				sentBy: true,
			},
			with: { tenant: true, sentBy: true },
		});
		if (pending.length === 0) return;

		log?.info({ count: pending.length }, "found pending messages to send");

		for (const data of pending) {
			const { message, tenant, sentBy } = data;
			try {
				await sock.sendMessage(`${tenant.phoneNumber}@s.whatsapp.net`, {
					text: [
						message,
						`> Dikirim oleh ${sentBy!.displayName ?? "Staff"}`,
					].join("\n\n"),
				});

				const [updated] = await db
					.update(chatbotMessages)
					.set({ status: "sent", sentAt: new Date() })
					.where(eq(chatbotMessages.id, data.id))
					.returning();

				await db.insert(auditLogs).values({
					userId: botUserId,
					action: "UPDATE",
					tableName: "chatbot_messages",
					recordId: data.id,
					details: auditDetail.update(
						`Bot mengirim pesan ${sentBy!.displayName} ke tenant #${tenant.id}: ${truncate(message)}`,
						omit(data, ["tenant", "sentBy"]),
						updated,
					),
				});

				log?.info(
					{ messageId: data.id, tenantId: tenant.id },
					"pending message sent successfully",
				);
			} catch (error) {
				log?.error(
					{ error, messageId: data.id, tenantId: tenant.id },
					"failed to send pending message",
				);
				await db
					.update(chatbotMessages)
					.set({ status: "sent" })
					.where(eq(chatbotMessages.id, data.id));
			}
		}
	} catch (error) {
		console.log(error);
		log?.error({ error }, "failed to poll pending messages");
		throw error;
	}
};
