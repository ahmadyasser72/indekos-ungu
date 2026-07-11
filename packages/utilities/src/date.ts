import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/id";

dayjs.locale("id");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Makassar");
dayjs.extend(relativeTime);

export const formatDate = (
	date: Date | string | number | null | undefined,
	formatStr = "DD MMM YYYY",
): string => {
	if (!date) return "-";
	return dayjs(date).format(formatStr);
};

export const formatPeriod = (date: Date | string | number) =>
	formatDate(date, "YYYY-MM");

export const normalizePeriodRange = (from: Date, to: Date) =>
	dayjs(from).isAfter(to) ? { from, to: from } : { from, to };

export default dayjs;
