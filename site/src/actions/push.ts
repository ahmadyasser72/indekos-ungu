import { db, eq } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	pushSubscriptions,
} from "@indekos/database/schema";
import { sendPush } from "@indekos/utilities/push";

import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const subscribe = defineAction({
	accept: "json",
	input: z.object({
		endpoint: z.url(),
		keys: z.object({ auth: z.string(), p256dh: z.string() }),
	}),
	handler: async (input, context) => {
		const user = context.locals.user!;

		await db.insert(pushSubscriptions).values({
			userId: user.id,
			endpoint: input.endpoint,
			authKey: input.keys.auth,
			p256dhKey: input.keys.p256dh,
		});
		context.session?.set("pushEndpoint", input.endpoint);

		await db.insert(auditLogs).values({
			userId: user.id,
			action: "CREATE",
			tableName: "push_subscriptions",
			details: auditDetail.create("Subscribed to push notifications", {
				endpoint: input.endpoint,
			}),
		});

		return { success: true };
	},
});

export const unsubscribe = defineAction({
	accept: "json",
	input: z.object({ endpoint: z.url() }),
	handler: async ({ endpoint }, context) => {
		await db
			.delete(pushSubscriptions)
			.where(eq(pushSubscriptions.endpoint, endpoint));
		context.session?.delete("pushEndpoint");

		await db.insert(auditLogs).values({
			userId: context.locals.user!.id,
			action: "DELETE",
			tableName: "push_subscriptions",
			details: auditDetail.delete("Unsubscribed from push notifications", {
				endpoint,
			}),
		});

		return { success: true };
	},
});

export const test = defineAction({
	accept: "json",
	handler: async (_, context) => {
		const user = context.locals.user!;

		const result = await sendPush([user], {
			title: "Test Notifikasi",
			body: "Notifikasi berhasil dikirim! 🎉",
		});

		await db.insert(auditLogs).values({
			userId: user.id,
			action: "CREATE",
			tableName: "notifications",
			details: auditDetail.notification(
				"Test push notification sent",
				"push",
				user.id,
			),
		});

		return { sent: result.sent };
	},
});
