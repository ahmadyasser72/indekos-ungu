import { db, eq } from "@indekos/database";
import {
	auditDetail,
	chatbotMessages,
	chatRequests,
} from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const send = defineAction({
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

export const request = {
	accept: defineAction({
		accept: "form",
		input: z.object({
			chatRequestId: z.coerce.number(),
		}),
		handler: async ({ chatRequestId }, context) => {
			const log = context.locals.logger.child({
				module: "actions:manage:tenant-chat:acceptChatRequest",
			});

			const user = context.locals.user;
			if (!user?.allowChat) {
				log.warn({ userId: user?.id }, "user lacks chat permission");
				throw new ActionError({
					code: "FORBIDDEN",
					message: "Anda tidak memiliki izin untuk menerima permintaan chat.",
				});
			}

			const chatRequest = await db.query.chatRequests.findFirst({
				where: { id: chatRequestId },
				with: { tenant: { columns: { id: true, fullName: true } } },
			});

			if (!chatRequest) {
				log.error({ chatRequestId }, "chat request not found");
				throw new ActionError({
					code: "NOT_FOUND",
					message: "Permintaan chat tidak ditemukan.",
				});
			}

			if (chatRequest.status !== "pending") {
				log.warn(
					{ chatRequestId, status: chatRequest.status },
					"chat request already processed",
				);
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Permintaan chat sudah diproses sebelumnya.",
				});
			}

			const [updated] = await db
				.update(chatRequests)
				.set({
					status: "accepted",
					acceptedBy: user.id,
					acceptedAt: new Date(),
				})
				.where(eq(chatRequests.id, chatRequestId))
				.returning();

			await context.locals.logAudit(
				"UPDATE",
				"chat_requests",
				chatRequestId,
				auditDetail.update(
					`Menerima permintaan chat dari ${chatRequest.tenant.fullName}`,
					chatRequest,
					updated,
				),
			);

			log.info(
				{ chatRequestId, tenantId: chatRequest.tenantId },
				"chat request accepted",
			);
			return { success: true };
		},
	}),

	close: defineAction({
		accept: "form",
		input: z.object({
			chatRequestId: z.coerce.number(),
		}),
		handler: async ({ chatRequestId }, context) => {
			const log = context.locals.logger.child({
				module: "actions:manage:tenant-chat:closeChatRequest",
			});

			const user = context.locals.user;
			if (!user?.allowChat) {
				log.warn({ userId: user?.id }, "user lacks chat permission");
				throw new ActionError({
					code: "FORBIDDEN",
					message: "Anda tidak memiliki izin untuk menutup permintaan chat.",
				});
			}

			const chatRequest = await db.query.chatRequests.findFirst({
				where: { id: chatRequestId },
				with: { tenant: { columns: { id: true, fullName: true } } },
			});

			if (!chatRequest) {
				log.error({ chatRequestId }, "chat request not found");
				throw new ActionError({
					code: "NOT_FOUND",
					message: "Permintaan chat tidak ditemukan.",
				});
			}

			if (chatRequest.status !== "accepted") {
				log.warn(
					{ chatRequestId, status: chatRequest.status },
					"can only close accepted chat requests",
				);
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Hanya permintaan chat yang diterima yang dapat ditutup.",
				});
			}

			const [updated] = await db
				.update(chatRequests)
				.set({
					status: "closed",
					closedBy: user.id,
					closedAt: new Date(),
				})
				.where(eq(chatRequests.id, chatRequestId))
				.returning();

			await context.locals.logAudit(
				"UPDATE",
				"chat_requests",
				chatRequestId,
				auditDetail.update(
					`Menutup chat dengan ${chatRequest.tenant.fullName}`,
					chatRequest,
					updated,
				),
			);

			log.info(
				{ chatRequestId, tenantId: chatRequest.tenantId },
				"chat request closed",
			);
			return { success: true };
		},
	}),
};
