import { db, eq } from "@indekos/database";
import {
	generatePaymentLink as createPaymentLink,
	DuitkuError,
	InvoicePaymentError,
} from "@indekos/database/duitku/invoice-payment";
import { auditDetail, invoices, notifications } from "@indekos/database/schema";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const generatePaymentLink = defineAction({
	accept: "form",
	input: z.object({
		invoice_id: z.coerce.number(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:invoices:generatePaymentLink",
		});

		try {
			log.info(
				{ invoiceId: input.invoice_id },
				"attempting to generate payment link",
			);

			const result = await createPaymentLink(
				input.invoice_id,
				context.locals.user?.id,
				{ logger: log },
			);

			log.info({ invoiceId: input.invoice_id }, "payment link generated");
			return result;
		} catch (error) {
			if (error instanceof InvoicePaymentError) {
				log.error(
					{ error, invoiceId: input.invoice_id },
					"invoice payment error",
				);
				throw new ActionError({
					code: "BAD_REQUEST",
					message: error.message,
				});
			}
			if (error instanceof DuitkuError) {
				log.error({ error, invoiceId: input.invoice_id }, "duitku error");
				throw new ActionError({
					code: "BAD_REQUEST",
					message: `Duitku: ${error.message}`,
				});
			}

			log.error({ error, invoiceId: input.invoice_id }, "unknown error");
			throw new ActionError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Gagal membuat link pembayaran.",
			});
		}
	},
});

export const markAsPaid = defineAction({
	accept: "form",
	input: z.object({
		invoice_id: z.coerce.number(),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({
			module: "actions:manage:invoices:markAsPaid",
		});
		const invoiceId = input.invoice_id;

		const invoice = await db.query.invoices.findFirst({
			where: { id: invoiceId },
			with: { lease: { with: { tenant: true } } },
		});

		if (!invoice) {
			log.error({ invoiceId }, "invoice not found");
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Invoice tidak ditemukan.",
			});
		}

		if (invoice.status === "paid") {
			log.error({ invoiceId }, "invoice already paid");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Invoice sudah lunas.",
			});
		}

		log.info({ invoiceId }, "attempting to mark invoice as paid");

		await db
			.update(invoices)
			.set({ status: "paid", paidAt: new Date() })
			.where(eq(invoices.id, invoiceId));

		if (invoice.lease?.tenant) {
			await db.insert(notifications).values({
				tenantId: invoice.lease.tenant.id,
				invoiceId: invoice.id,
				type: "payment_success",
				status: "pending",
			});
		}

		await context.locals.logAudit(
			"UPDATE",
			"invoices",
			invoiceId,
			auditDetail.payment(
				`Manual: Menandai invoice #${invoiceId} sebagai lunas`,
				invoice.amount,
				"manual",
			),
		);

		log.info({ invoiceId }, "invoice marked as paid");
		return { success: true };
	},
});
