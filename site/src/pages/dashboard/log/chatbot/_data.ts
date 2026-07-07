import { CHATBOT_DIRECTIONS, db } from "@indekos/database";
import { parseDateRange } from "@indekos/utilities/date";

import { render } from "@croct/md-lite";
import { z } from "astro/zod";
import { countBy, uniqBy } from "es-toolkit";

import type { Stat } from "~/components/data/stats.astro";
import { periodFields, querySchema, statusSchema, paginationFields } from "~/lib/query";

export const chatbotQuerySchema = z.object({
	query: querySchema,
	direction: statusSchema(CHATBOT_DIRECTIONS),
	...periodFields,
	...paginationFields,
});

export const fetchChatbotLogs = async (
	params: z.infer<typeof chatbotQuerySchema>,
) => {
	const { startDate, endDate } = parseDateRange(params.from, params.to);

	const logs = await db.query.chatbotMessages.findMany({
		where: {
			...(params.query && {
				OR: [
					{ message: { like: `%${params.query}%` } },
					{ tenant: { fullName: { like: `%${params.query}%` } } },
				],
			}),

			...(params.direction && { direction: params.direction }),

			sentAt: { gte: startDate, lte: endDate },
		},
		with: {
			tenant: {
				with: {
					lease: { with: { room: true } },
				},
			},
		},
		orderBy: { sentAt: "desc" },
	});

	return logs.map(({ tenant, ...log }) => ({
		...log,
		tenantName: tenant.fullName,
		roomNumber: tenant.lease?.room?.roomNumber ?? "-",
	}));
};

export const DIRECTION_BADGES = {
	incoming: "badge-info",
	outgoing: "badge-success",
} satisfies Record<(typeof CHATBOT_DIRECTIONS)[number], string>;

export const DIRECTION_ICONS = {
	incoming: "lucide:arrow-down-circle" as const,
	outgoing: "lucide:arrow-up-circle" as const,
} satisfies Record<(typeof CHATBOT_DIRECTIONS)[number], string>;

export const DIRECTION_LABELS = {
	incoming: "Masuk",
	outgoing: "Keluar",
} satisfies Record<(typeof CHATBOT_DIRECTIONS)[number], string>;

export const formatMessageMarkdown = (message: string): string =>
	render(message, {
		fragment: (node) =>
			node.children
				.join("")
				.replaceAll("\n", "<br>")
				.split("<br>")
				.filter(Boolean)
				.join("<br>"),
		text: (node) => node.content,
		bold: (node) => `<b>${node.children}</b>`,
		italic: (node) => `<b>${node.children}</b>`,
		strike: (node) => `<s>${node.children}</s>`,
		code: (node) => `<code>${node.content}</code>`,
		link: (node) => `<a href="${node.href}">${node.children}</a>`,
		image: (node) => `<p>[gambar ${node.alt}]</p>`,
		paragraph: (node) => `<p>${node.children.join("")}</p><br>`,
	});

export const getChatbotStats = (
	logs: Awaited<ReturnType<typeof fetchChatbotLogs>>,
): Stat[] => {
	const { incoming = 0, outgoing = 0 } = countBy(
		logs,
		({ direction }) => direction,
	);
	const uniqueTenants = uniqBy(logs, ({ tenantId }) => tenantId).length;
	const incomingRate =
		logs.length > 0 ? Math.round((incoming / logs.length) * 100) : 0;

	return [
		{
			title: "Total Percakapan",
			value: logs.length,
			desc: "Pesan masuk dan keluar",
			icon: "lucide:messages-square",
		},
		{
			title: "Pesan Masuk",
			value: incoming,
			desc: `${incomingRate}% dari total`,
			icon: "lucide:arrow-down-circle",
		},
		{
			title: "Pesan Keluar",
			value: outgoing,
			desc: `${uniqueTenants} penghuni berbeda`,
			icon: "lucide:arrow-up-circle",
		},
	];
};
