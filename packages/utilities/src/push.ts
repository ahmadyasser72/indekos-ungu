import { db, inArray } from "@indekos/database";
import {
	pushHistory,
	pushSubscriptions,
	type PushData,
	type User,
} from "@indekos/database/schema";

import { groupBy } from "es-toolkit";
import webpush from "web-push";

import dayjs from "./date";
import type { Logger } from "./logger";

export const sendPush = async (
	to: (Pick<User, "id"> | string)[],
	data: PushData,
	options?: { logger?: Logger },
) => {
	// Spawn a dedicated child logger stamping the specific destination utility path
	const log = options?.logger?.child({ module: "utilities:push:sendPush" });

	if (to.length === 0) {
		log?.debug(
			"push-service: empty recipient target array provided, skipping execution path",
		);
		return;
	}

	const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
	if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
		log?.error(
			"push-service: environment setup failure: VAPID configuration variables are not set",
		);
		throw new Error("VAPID_* is not set");
	}

	const userIdentifiers = [] as number[];
	const endpoints = [] as string[];

	for (const target of to) {
		if (typeof target === "string") {
			endpoints.push(target);
		} else {
			userIdentifiers.push(target.id);
		}
	}

	log?.info(
		{
			recipientCount: to.length,
			structuredUserCount: userIdentifiers.length,
			directEndpointCount: endpoints.length,
		},
		"push-service: scanning database to retrieve active browser push registration subscriptions",
	);

	try {
		const subscriptions = await db.query.pushSubscriptions.findMany({
			where: {
				OR: [
					{
						user: {
							id: { in: userIdentifiers },
							lastAccessed: {
								gte: dayjs().startOf("day").subtract(1, "day").toDate(),
							},
						},
					},
					{ endpoint: { in: endpoints } },
				],
			},
		});

		if (subscriptions.length === 0) {
			log?.info(
				"push-service: no active matching user browser subscriptions found in database records",
			);
			return;
		}

		log?.info(
			{ targetSubscriptionCount: subscriptions.length },
			"push-service: dispatching web-push payload notification packets",
		);

		const results = await Promise.allSettled(
			subscriptions.map((subscription) =>
				webpush.sendNotification(
					{
						endpoint: subscription.endpoint,
						keys: {
							auth: subscription.authKey,
							p256dh: subscription.p256dhKey,
						},
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

			const statusCode = promise.value.statusCode;
			return statusCode === 404 || statusCode === 410 ? "invalid" : "sent";
		});

		// 1. Process invalid, expired, or uninstalled subscriptions
		if (grouped.invalid?.length > 0) {
			const invalidSubscriptionEndpoints = grouped.invalid.map(
				([index]) => subscriptions[index].endpoint,
			);

			log?.warn(
				{ invalidSubscriptionCount: invalidSubscriptionEndpoints.length },
				"push-service: purging expired subscription tokens from database records due to 404/410 vendor codes",
			);

			await db
				.delete(pushSubscriptions)
				.where(
					inArray(pushSubscriptions.endpoint, invalidSubscriptionEndpoints),
				);
		}

		// 2. Process successfully delivered notifications
		if (grouped.sent?.length > 0) {
			log?.info(
				{ successfullyDeliveredCount: grouped.sent.length },
				"push-service: recording historical tracking logs for sent packets",
			);

			await db.insert(pushHistory).values(
				grouped.sent.map(([index]) => ({
					endpoint: subscriptions[index].endpoint,
					data,
				})),
			);
		}

		// 3. Monitor unhandled execution drops or network glitches
		if (grouped.failed?.length > 0) {
			for (const [index, promise] of grouped.failed) {
				log?.error(
					{
						error: (promise as PromiseRejectedResult).reason,
						targetEndpoint: subscriptions[index].endpoint,
					},
					"push-service: vendor communication channel rejected notification dispatch payload",
				);
			}
		}
	} catch (error) {
		log?.error(
			{ error: error },
			"push-service: unhandled exception encountered inside push serialization delivery pipeline",
		);
		throw error;
	}
};
