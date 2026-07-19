import { Calendar, type Options } from "vanilla-calendar-pro";

import type { CalendarData } from "./_lease-calendar-helpers";

export interface CalendarConfig {
	selector: string;
	onClickDate?: (params: {
		calendar: HTMLElement;
		date: string | undefined;
		data: CalendarData;
	}) => void;
}

export const initCalendar = (config: CalendarConfig) => {
	const init = (node?: unknown) => {
		if (!(node instanceof HTMLElement)) return;

		const elements = node.matches(config.selector)
			? [node]
			: [...node.querySelectorAll<HTMLElement>(config.selector)];

		for (const element of elements) {
			const data = JSON.parse(element.dataset.calendar!) as CalendarData;

			new Calendar(element, {
				disableToday: data.disableToday ?? true,
				disableDatesPast: data.disablePast ?? true,
				...(data.selectedMonth !== undefined && {
					selectedMonth: data.selectedMonth as Options["selectedMonth"],
				}),
				...(data.selectedYear !== undefined && {
					selectedYear: data.selectedYear,
				}),
				...(data.enabled && {
					disableAllDates: true,
					enableDates: data.enabled,
				}),
				...(data.disabled && {
					disableDates: data.disabled,
				}),
				onClickDate: config.onClickDate
					? (self) => {
							const [date] = self.context.selectedDates;
							config.onClickDate!({ calendar: element, date, data });
						}
					: undefined,
			}).init();
		}
	};

	init(document.documentElement);
	window.htmx.onLoad((node) => init(node));
};
