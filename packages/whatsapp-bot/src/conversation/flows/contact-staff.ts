import { db } from "@indekos/database";
import { auditDetail, auditLogs, chatRequests } from "@indekos/database/schema";
import type { Logger } from "@indekos/utilities/logger";
import { sendPush } from "@indekos/utilities/push";

import type {
	ConversationSession,
	FlowDef,
	MessageInput,
} from "~/conversation/types";

export const notifyStaffNewChatRequest = async (
	tenant: ConversationSession["tenant"],
	chatRequest: { description: string },
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "lib:chat:notify-staff",
	});

	log?.debug(
		{ tenantId: tenant.id, roomNumber: tenant.lease?.room.roomNumber },
		"notifying staff of new chat request",
	);

	try {
		const users = await db.query.users.findMany({
			where: { role: "staff" },
		});

		if (users.length === 0) {
			log?.warn("no staff users found to notify");
			return;
		}

		await sendPush(
			users,
			{
				title: `Permintaan Chat dari ${tenant.fullName}`,
				body: chatRequest.description,
				url: "/dashboard/for/tenants",
				urlHtmx: `/dashboard/for/tenants/modal/chat-requests`,
			},
			{ logger: log },
		);

		const botWaUser = await db.query.users.findFirst({
			where: { username: "bot-wa" },
		});

		if (botWaUser) {
			await db.insert(auditLogs).values({
				userId: botWaUser.id,
				action: "CREATE",
				tableName: "push_history",
				details: auditDetail.notification(
					`Mengirim notifikasi permintaan chat dari ${tenant.fullName} ke staf`,
					"push",
					users.map(({ id }) => id),
				),
			});
		}

		log?.info(
			{
				tenantId: tenant.id,
				staff: users.length,
			},
			"staff notified of new chat request",
		);
	} catch (error) {
		log?.error(
			{ error: error, tenantId: tenant.id },
			"failed to send push notification",
		);
	}
};

const completeChatRequest = async (
	session: ConversationSession,
	text: string,
	logger?: Logger,
) => {
	const log = logger?.child({
		submodule: "conversation:contact_staff:complete",
	});

	if (text.length < 5) {
		log?.debug(
			{
				tenantId: session.tenant.id,
				descriptionLength: text.length,
			},
			"chat request description too short",
		);
		return {
			reply: [
				"✏️ Pesan terlalu pendek (min 5 karakter). Silakan tuliskan detail keperluan Anda, atau ketik *batal* untuk membatalkan.",
			].join("\n\n"),
		};
	}

	try {
		const [request] = await db
			.insert(chatRequests)
			.values({
				tenantId: session.tenant.id,
				description: text,
				status: "pending",
			})
			.returning();

		await notifyStaffNewChatRequest(session.tenant, request);

		log?.info(
			{
				tenantId: session.tenant.id,
				requestId: request.id,
			},
			"chat request created and saved to database",
		);

		return {
			reply: [
				"✅ Pesan Anda telah diteruskan ke staf/admin. Mohon tunggu, staf kami akan segera merespons Anda di obrolan ini.",
				"_Pesan yang Anda kirim sambil menunggu akan diterima oleh staf._",
				"_Ketik *batal* jika ingin membatalkan permintaan ini._",
			].join("\n\n"),
			next: null,
		};
	} catch (error) {
		log?.error(
			{ error, tenantId: session.tenant.id },
			"failed to create chat request",
		);
		throw error;
	}
};

export const contactStaffFlow: FlowDef = {
	name: "contact_staff",
	initialStep: "prompt",
	steps: {
		prompt: async (input, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:contact_staff:prompt",
			});

			const text = input.text.replace(/^cs\s*/i, "").trim();
			const lower = text.toLowerCase();

			if (text) {
				if (lower === "batal") {
					log?.debug(
						{ tenantId: session.tenant.id },
						"contact staff flow cancelled by user",
					);
					return {
						reply: "❌ Permintaan menghubungi staf dibatalkan.",
						next: null,
					};
				}

				return completeChatRequest(session, text, options?.logger);
			}

			return {
				reply: [
					"Halo! Silakan ketik alasan atau pesan yang ingin Anda sampaikan kepada staf/admin...",
					"_(Ketik *batal* jika ingin membatalkan)_",
				].join("\n\n"),
				next: "collect",
			};
		},

		collect: async (input: MessageInput, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:contact_staff:collect",
			});

			const text = input.text.trim();
			const lower = text.toLowerCase();

			if (lower === "batal") {
				log?.debug(
					{ tenantId: session.tenant.id },
					"contact staff flow cancelled by user",
				);
				return {
					reply: "❌ Permintaan menghubungi staf dibatalkan.",
					next: null,
				};
			}

			return completeChatRequest(session, text, options?.logger);
		},
	},
};
