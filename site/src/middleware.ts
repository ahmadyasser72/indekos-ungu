import { db, eq } from "@indekos/database";
import { users } from "@indekos/database/schema";
import dayjs from "@indekos/utilities/date";
import { createLogger } from "@indekos/utilities/logger";

import { getActionContext } from "astro:actions";
import { defineMiddleware } from "astro:middleware";
import { z } from "astro/zod";

import { logAudit } from "~/lib/audit-log";
import { getPuppeteerToken } from "~/lib/pdf";

const baseLogger = createLogger("site-middleware");

export const onRequest = defineMiddleware(async (context, next) => {
	const requestLogger = baseLogger.child({
		path: context.url.pathname,
		method: context.request.method,
	});

	context.locals.logger = requestLogger;

	const persistQuery = new URLSearchParams();
	context.locals.parseQuery = (schema) => {
		const querySchema = z
			.instanceof(URLSearchParams)
			.transform((searchParams) =>
				[...searchParams.entries()].reduce<Record<string, string | string[]>>(
					(acc, [key, value]) => {
						if (!value) return acc;
						acc[key] = value;
						return acc;
					},
					{},
				),
			)
			.transform((query) => {
				for (const [key, value] of Object.entries(query)) {
					if (value === "reset" || value.includes("reset")) delete query[key];
				}
				return query;
			});

		const rawQuery = context.url.searchParams;
		const hxCurrentUrl = context.request.headers.get("hx-current-url")!;

		try {
			const query = querySchema.parse(
				new URLSearchParams({
					...(hxCurrentUrl &&
						Object.fromEntries(new URL(hxCurrentUrl).searchParams.entries())),
					...Object.fromEntries(rawQuery.entries()),
				}),
			);

			const parsed = schema.parse(query);
			for (const key of Object.keys(schema.shape)) {
				const value = parsed[key];
				if (!value || typeof value !== "string") continue;
				persistQuery.set(key, value);
			}
			return parsed;
		} catch (error) {
			requestLogger.warn(
				{ error, hxCurrentUrl },
				"middleware: query validation exception",
			);

			throw error;
		}
	};

	const user = await context.session?.get("user");
	if (user) {
		context.locals.logger = requestLogger.child({
			userId: user.id,
			userRole: user.role,
		});

		if (user.lastAccessed && dayjs().diff(user.lastAccessed, "minutes") > 5) {
			const now = new Date();
			try {
				await db
					.update(users)
					.set({ lastAccessed: now })
					.where(eq(users.id, user.id));

				user.lastAccessed = now;
			} catch (error) {
				context.locals.logger.error(
					{ error },
					"middleware: failed updating user lastAccessed timestamp",
				);
			}
		}

		context.session?.set("user", user);
		context.locals.user = { ...user, allowEdit: user.role !== "owner" };
	}

	const { action } = getActionContext(context);
	if (
		context.url.pathname.startsWith("/dashboard") ||
		(action &&
			(action.name.startsWith("manage.") || action.name.startsWith("push.")))
	) {
		const puppeteerToken = context.request.headers.get("x-puppeteer");
		if (puppeteerToken && puppeteerToken === getPuppeteerToken()) {
			const userId = context.url.searchParams.get("user");

			context.locals.logger.info(
				{ puppeteerTargetUserId: userId },
				"middleware: verified puppeteer token hook signature",
			);

			const user = await db.query.users.findFirst({
				columns: { id: true, username: true, displayName: true, role: true },
				where: { id: userId ? Number(userId) : undefined, role: "staff" },
			});

			context.locals.user = {
				id: user?.id ?? 0,
				name: user?.displayName ?? user?.username ?? "Staff",
				role: user?.role ?? "staff",
				lastAccessed: null,
			};

			return next();
		}

		if (!user) {
			context.locals.logger.warn(
				"middleware: unauthenticated gate blocking access, redirecting to login",
			);
			return context.redirect(new URL("/login", context.url).pathname);
		}
	}

	// Action helpers
	context.locals.logAudit = (action, tableName, recordId, details) =>
		logAudit(
			db,
			context.locals.user?.id ?? null,
			action,
			tableName,
			recordId,
			details,
		);
	context.locals.actionResults = [];

	const pushEndpointHeader = context.request.headers.get("push-endpoint");
	if (pushEndpointHeader && context.locals.user) {
		const pushActive = await db.query.pushSubscriptions.findFirst({
			columns: { id: true },
			where: { userId: context.locals.user.id, endpoint: pushEndpointHeader },
		});

		if (pushActive) context.session?.set("pushEndpoint", pushEndpointHeader);
	}

	const response = await next();
	if (persistQuery.size > 0) {
		response.headers.set(
			"hx-replace-url",
			`${context.url.pathname}?${persistQuery}`,
		);
	}

	return response;
});
