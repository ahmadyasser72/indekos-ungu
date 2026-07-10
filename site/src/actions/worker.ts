import { db } from "@indekos/database";
import { auditDetail, auditLogs } from "@indekos/database/schema";
import { runInvoiceGeneration } from "@indekos/scheduler/invoice-generation";
import { runMonthlyReport } from "@indekos/scheduler/monthly-report";
import { runOverdueCheck } from "@indekos/scheduler/overdue";
import { runOverdueReminder } from "@indekos/scheduler/overdue-reminder";
import { runPaymentReminder } from "@indekos/scheduler/payment-reminder";
import type { SchedulerWorkerFunction } from "@indekos/scheduler/types";
import dayjs from "@indekos/utilities/date";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

const WorkerKind = z.enum([
	"payment-reminder",
	"overdue-reminder",
	"overdue",
	"invoice",
	"report",
]);

const workers = {
	"payment-reminder": runPaymentReminder,
	"overdue-reminder": runOverdueReminder,
	overdue: runOverdueCheck,
	invoice: runInvoiceGeneration,
	report: runMonthlyReport,
} satisfies Record<z.infer<typeof WorkerKind>, SchedulerWorkerFunction>;

export const trigger = defineAction({
	accept: "form",
	input: z.object({
		worker: WorkerKind,
		target: z.iso
			.datetime({ local: true })
			.default(dayjs().format("YYYY-MM-DDTHH:mm")),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:notifications:trigger",
		});

		try {
			const systemUser = await db.query.users.findFirst({
				where: { username: "system" },
			});

			if (!systemUser) {
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Akun sistem tidak ditemukan.",
				});
			}

			log.info(input, "triggering manual notification worker execution");

			const worker = workers[input.worker];
			const result = await worker(systemUser, dayjs(input.target).toDate(), {
				logger: log,
			});

			await db.insert(auditLogs).values({
				userId: context.locals.user!.id,
				action: "CREATE",
				tableName: "notifications",
				details: auditDetail.generic(
					`Manual trigger worker: ${input.worker} untuk tanggal ${input.target}`,
				),
			});

			log.info(input, "notification worker execution completed successfully");

			return { success: true, worker: input.worker, message: result.message };
		} catch (error) {
			if (error instanceof ActionError) {
				throw error;
			}

			log.error({ error, ...input }, "notification trigger failed");

			throw new ActionError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to trigger notification worker",
			});
		}
	},
});
