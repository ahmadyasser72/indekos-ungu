import { db, eq } from "@indekos/database";
import { config, verifyCallbackSignature } from "@indekos/database/duitku";
import {
	auditDetail,
	auditLogs,
	invoices,
	notifications,
} from "@indekos/database/schema";
import { parseInvoiceNumber } from "@indekos/utilities/transforms";

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	const formData = await request.formData();
	const params = Object.fromEntries(formData.entries());

	const {
		merchantCode,
		amount,
		merchantOrderId,
		signature,
		reference,
		resultCode,
	} = params;

	// Create a request-scoped child logger extending the middleware logger instance
	const requestLogger = locals.logger.child({
		module: "api:duitku-callback",
		orderId: merchantOrderId || "MISSING",
		ref: reference || "MISSING",
	});

	requestLogger.info("callback: received payload");

	if (!merchantCode || !amount || !merchantOrderId || !signature) {
		requestLogger.error(
			{ receivedKeys: Object.keys(params) },
			"callback: missing required parameters",
		);
		return new Response(null, { status: 400 });
	}

	const { apiKey } = config();
	const parsedAmount = Number.parseInt(amount, 10);

	if (
		!verifyCallbackSignature(
			merchantCode,
			parsedAmount,
			merchantOrderId,
			signature,
			apiKey,
		)
	) {
		requestLogger.error(
			{ amount: parsedAmount },
			"callback: invalid signature",
		);
		return new Response(null, { status: 400 });
	}

	const invoiceId = parseInvoiceNumber(merchantOrderId);
	if (Number.isNaN(invoiceId)) {
		requestLogger.warn("callback: invalid merchantOrderId format");
		return new Response(null, { status: 200 });
	}

	// Append the database invoice identifier to the child logger context
	const log = requestLogger.child({ invoiceId });

	const invoice = await db.query.invoices.findFirst({
		where: { id: invoiceId },
		with: { lease: { with: { tenant: true, room: true } } },
	});

	if (!invoice) {
		log.warn("callback: invoice not found in database");
		return new Response(null, { status: 200 });
	}

	if (invoice.callbackPayload) {
		log.info("callback: duplicate callback received, skipping processing");
		return new Response(null, { status: 200 });
	}

	if (resultCode === "00") {
		const rawPayload = JSON.stringify(params);

		try {
			db.transaction((tx) => {
				tx.update(invoices)
					.set({
						status: "paid",
						callbackPayload: rawPayload,
						duitkuReference: reference || invoice.duitkuReference,
					})
					.where(eq(invoices.id, invoiceId))
					.run();

				tx.insert(notifications)
					.values({
						tenantId: invoice.lease!.tenantId,
						invoiceId: invoice.id,
						type: "payment_success",
						status: "pending",
					})
					.run();

				tx.insert(auditLogs)
					.values({
						action: "UPDATE",
						tableName: "invoices",
						recordId: invoiceId,
						details: auditDetail.payment(
							`Duitku callback: Pembayaran sukses (Ref: ${reference ?? invoice.duitkuReference}). Kamar: ${invoice.lease?.room?.roomNumber ?? "-"}, Tenant: ${invoice.lease?.tenant?.fullName ?? "-"}, Amount: ${parsedAmount}`,
							parsedAmount,
							reference ?? invoice.duitkuReference,
						),
					})
					.run();
			});

			log.info("callback: invoice successfully marked as paid");
		} catch (error) {
			log.error({ error }, "callback: failed to execute database transaction");
			return new Response(null, { status: 500 });
		}
	} else {
		log.info({ resultCode }, "callback: non-success resultCode received");
	}

	return new Response(null, { status: 200 });
};
