import dayjs, { formatPeriod } from "@indekos/utilities/date";

import { z } from "astro/zod";

export const querySchema = z.string().optional();

export const periodField = z.string().default(() => formatPeriod(new Date()));

export const periodFields = {
	from: periodField.transform((value) =>
		dayjs(`${value}-01`).startOf("month").toDate(),
	),
	to: periodField.transform((value) =>
		dayjs(`${value}-01`).endOf("month").toDate(),
	),
} as const;

export const statusSchema = <T extends readonly string[]>(values: T) =>
	z.enum(values).optional().catch(undefined);
