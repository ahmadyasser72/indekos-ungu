import { db, USER_ROLES } from "@indekos/database";

import { z } from "astro/zod";

import { querySchema, statusSchema, paginationFields } from "~/lib/query";

export const accountsQuerySchema = z.object({
	query: querySchema,
	role: statusSchema(USER_ROLES),
	...paginationFields,
});

export const fetchAccounts = async (
	params: z.infer<typeof accountsQuerySchema>,
) => {
	const accounts = await db.query.users.findMany({
		columns: {
			id: true,
			username: true,
			displayName: true,
			lastAccessed: true,
			role: true,
		},
		where: {
			role: { ne: "system" },
			...(params.query && {
				OR: [
					{ username: { like: `%${params.query}%` } },
					{ displayName: { like: `%${params.query}%` } },
				],
			}),
			...(params.role && { role: params.role }),
		},
	});

	return accounts;
};
