import { getCurrentMonthStr } from "@indekos/utilities/date";

import { z } from "astro/zod";

export const querySchema = z.string().optional();

export const periodFields = {
	from: z.string().default(() => getCurrentMonthStr()),
	to: z.string().default(() => getCurrentMonthStr()),
} as const;

export const statusSchema = <T extends readonly string[]>(values: T) =>
	z.enum(values).optional().catch(undefined);

export const paginationFields = {
	page: z.coerce.number().int().positive().default(1).catch(1),
	"page-size": z.coerce
		.number()
		.int()
		.positive()
		.max(100)
		.default(10)
		.catch(10),
} as const;

export interface PaginationResult<T> {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export function paginateArray<T>(
	items: T[],
	{
		page,
		"page-size": pageSize,
	}: z.infer<z.ZodObject<typeof paginationFields>>,
): PaginationResult<T> {
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * pageSize;

	return {
		items: items.slice(start, start + pageSize),
		page: safePage,
		pageSize,
		total,
		totalPages,
	};
}
