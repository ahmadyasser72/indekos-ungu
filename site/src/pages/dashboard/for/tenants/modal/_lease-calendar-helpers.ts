import dayjs from "@indekos/utilities/date";

export interface CalendarData {
	enabled?: string[];
	disabled?: string[];
	disablePast?: boolean;
	disableToday?: boolean;
	selectedMonth?: number;
	selectedYear?: number;
}

export const datesBetween = (start: Date, end: Date) => {
	const dates: string[] = [];
	let current = dayjs(start).startOf("day");
	const last = dayjs(end).endOf("day");
	while (current.isBefore(last) || current.isSame(last, "day")) {
		dates.push(current.format("YYYY-MM-DD"));
		current = current.add(1, "day");
	}

	return dates;
};

export const endDateCalendar = (
	startDate: string | Date,
	options?: { disablePast?: boolean },
) => {
	const nextMonth = dayjs(startDate).add(1, "month");
	const dates = [] as string[];
	const start = dayjs(startDate).startOf("day");
	for (let i = 1; i <= 24; i += 1)
		dates.push(start.add(i, "month").format("YYYY-MM-DD"));

	return {
		enabled: dates,
		selectedMonth: nextMonth.month(),
		selectedYear: nextMonth.year(),
		...options,
	};
};
