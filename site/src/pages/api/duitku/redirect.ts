import { parseInvoiceNumber } from "@indekos/utilities/transforms";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url, redirect, locals }) => {
	// Retrieve the pre-configured request-scoped child logger from middleware context
	const log = locals.logger.child({ module: "api:duitku:redirect" });

	const merchantOrderId = url.searchParams.get("merchantOrderId") ?? "";
	const invoiceId = parseInvoiceNumber(merchantOrderId);

	if (!merchantOrderId || Number.isNaN(invoiceId)) {
		log.warn(
			{
				requestUrl: url.href,
				providedMerchantOrderId: merchantOrderId,
			},
			"return-redirect: missing or structurally invalid merchant order parameter reference",
		);

		return new Response(
			"Invalid payment reference. Please check your email for the receipt or contact support.",
			{
				status: 400,
				headers: { "Content-Type": "text/plain" },
			},
		);
	}

	log.info(
		{ invoiceId, merchantOrderId },
		"return-redirect: successfully parsed checkout loop reference, executing interface forward",
	);

	return redirect(`/invoice/${invoiceId}`);
};
