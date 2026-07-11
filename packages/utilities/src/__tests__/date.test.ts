import { describe, expect, it } from "bun:test";

import dayjs, { formatDate, normalizePeriodRange } from "../date.ts";

describe("formatDate", () => {
	it("returns '-' for null date", () => {
		expect(formatDate(null)).toBe("-");
	});

	it("returns '-' for undefined date", () => {
		expect(formatDate(undefined)).toBe("-");
	});

	it("formats a Date object with default format", () => {
		const date = new Date(2025, 0, 15); // Jan 15, 2025
		expect(formatDate(date)).toBe("15 Jan 2025");
	});

	it("formats a date string", () => {
		expect(formatDate("2025-06-01")).toBe("01 Jun 2025");
	});

	it("uses custom format string", () => {
		const date = new Date(2025, 5, 15);
		expect(formatDate(date, "YYYY-MM-DD")).toBe("2025-06-15");
	});
});

describe("normalizePeriodRange", () => {
	it("returns same values when from <= to", () => {
		expect(
			normalizePeriodRange(
				dayjs("2025-01-01").toDate(),
				dayjs("2025-06-01").toDate(),
			),
		).toEqual({
			from: dayjs("2025-01-01").toDate(),
			to: dayjs("2025-06-01").toDate(),
		});
	});

	it("sets to = from when from > to", () => {
		expect(
			normalizePeriodRange(
				dayjs("2025-06-01").toDate(),
				dayjs("2025-01-01").toDate(),
			),
		).toEqual({
			from: dayjs("2025-06-01").toDate(),
			to: dayjs("2025-06-01").toDate(),
		});
	});
});
