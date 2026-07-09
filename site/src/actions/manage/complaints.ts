import { db, eq } from "@indekos/database";
import { auditDetail, complaints } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { omit } from "es-toolkit";

export const process = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
	}),
	handler: async ({ id }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:complaints:process",
		});
		const complaint = await db.query.complaints.findFirst({
			columns: { id: true, status: true },
			where: { id },
		});
		if (!complaint?.id) {
			log.error({ complaintId: id }, "complaint not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Komplain tidak ditemukan.",
			});
		}

		if (complaint.status !== "open") {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Hanya komplain dengan status 'Terbuka' yang dapat diproses.",
			});
		}

		log.info(
			{ complaintId: id },
			"attempting to mark complaint as in progress",
		);

		const [updated] = await db
			.update(complaints)
			.set({ status: "in_progress" })
			.where(eq(complaints.id, id))
			.returning({ id: complaints.id });

		await context.locals.logAudit(
			"UPDATE",
			"complaints",
			updated.id,
			auditDetail.update(
				`Memproses komplain`,
				{ status: complaint.status },
				{ status: "in_progress" },
			),
		);

		log.info("complaint marked as in progress");
		return updated;
	},
});

export const resolve = defineAction({
	accept: "form",
	input: z.object({
		id: z.coerce.number(),
		resolveNotes: z
			.string()
			.optional()
			.transform((s) => s?.trim() ?? null),
	}),
	handler: async ({ id, resolveNotes }, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:complaints:resolve",
		});
		const complaint = await db.query.complaints.findFirst({
			columns: { id: true, status: true, resolveNotes: true, resolvedBy: true },
			where: { id },
		});

		if (!complaint?.id) {
			log.error({ complaintId: id }, "complaint not found");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Komplain tidak ditemukan.",
			});
		}

		log.info({ complaintId: id }, "attempting to resolve complaint");

		const [updated] = await db
			.update(complaints)
			.set({
				status: "resolved",
				resolvedBy: context.locals.user!.id,
				resolveNotes,
			})
			.where(eq(complaints.id, id))
			.returning({ id: complaints.id });

		await context.locals.logAudit(
			"UPDATE",
			"complaints",
			updated.id,
			auditDetail.update(
				`Menyelesaikan komplain dengan catatan: ${resolveNotes || "-"}`,
				omit(complaint, ["id"]),
				{
					status: "resolved",
					resolveNotes,
					resolvedBy: context.locals.user!.id,
				},
			),
		);

		log.info("complaint resolved");
		return updated;
	},
});
