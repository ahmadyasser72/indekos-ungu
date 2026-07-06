import { db, inArray } from "@indekos/database";
import { pushSubscriptions, type User } from "@indekos/database/schema";

import { groupBy, mapValues } from "es-toolkit";
import webpush from "web-push";

export const sendPush = async (
	users: Pick<User, "id">[],
	data: { title: string; body: string; url?: string; imagePath?: string },
) => {
	const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
	if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY)
		throw new Error("VAPID_* is not set");

	const subscriptions = await db.query.pushSubscriptions.findMany({
		where: { user: { id: { in: users.map(({ id }) => id) } } },
	});

	if (subscriptions.length === 0) return { sent: 0 };

	const results = await Promise.allSettled(
		subscriptions.map((sub) =>
			webpush.sendNotification(
				{
					endpoint: sub.endpoint,
					keys: { auth: sub.authKey, p256dh: sub.p256dhKey },
				},
				JSON.stringify(data),
				{
					vapidDetails: {
						privateKey: VAPID_PRIVATE_KEY,
						publicKey: VAPID_PUBLIC_KEY,
						subject: VAPID_SUBJECT,
					},
				},
			),
		),
	);

	// Clean up expired subscriptions (HTTP 404/410)
	const grouped = groupBy([...results.entries()], ([, promise]) => {
		if (promise.status === "rejected") return "failed";

		const status = promise.value.statusCode;
		return status === 404 || status === 410 ? "invalid" : "sent";
	});

	if (grouped.invalid?.length > 0)
		await db.delete(pushSubscriptions).where(
			inArray(
				pushSubscriptions.endpoint,
				grouped.invalid.map(([id]) => subscriptions[id].endpoint),
			),
		);

	return mapValues(grouped, (items) => items.map(([id]) => id));
};
