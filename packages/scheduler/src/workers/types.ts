import type { User } from "@indekos/database/schema";
import type { Logger } from "@indekos/utilities/logger";

export type SchedulerWorkerResult = {
	success: boolean;
	processedCount: number;
	message: string;
};

export type SchedulerWorkerFunction = (
	systemUser: User,
	referenceDate?: Date,
	options?: { logger?: Logger },
) => Promise<SchedulerWorkerResult>;
