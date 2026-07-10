import { formatDate } from "@indekos/utilities/date";
import {
	formatCurrency,
	formatInvoiceNumber,
} from "@indekos/utilities/transforms";

import { db, eq } from "../index";
import { auditDetail, auditLogs, invoices } from "../schema";
import {
	createInvoice as duitkuCreateInvoice,
	DuitkuError,
	getPaymentUrlFromReference,
	type DuitkuExecutionOptions,
} from "./index";

export { DuitkuError };

export class InvoicePaymentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvoicePaymentError";
	}
}

export const generatePaymentLink = async (
	invoiceId: number,
	auditUserId?: number,
	options?: DuitkuExecutionOptions,
) => {
	const log = options?.logger?.child({
		module: "database:payment:generatePaymentLink",
		invoiceId,
	});

	const baseUrl = process.env.SITE_URL;
	if (!baseUrl) {
		log?.error("payment-service: SITE_URL environment variable is missing");
		throw new InvoicePaymentError(
			"Konfigurasi sistem tidak lengkap (SITE_URL belum diatur).",
		);
	}

	try {
		const invoice = await db.query.invoices.findFirst({
			where: { id: invoiceId },
			with: {
				lease: { with: { tenant: true, room: true } },
			},
		});

		if (!invoice) throw new InvoicePaymentError("Invoice tidak ditemukan.");
		if (invoice.status === "paid")
			throw new InvoicePaymentError("Invoice sudah lunas.");
		if (!invoice.lease.isActive)
			throw new InvoicePaymentError("Sewa sudah tidak aktif.");

		if (invoice.duitkuReference) {
			log?.info(
				{ reference: invoice.duitkuReference },
				"payment-service: existing active reference returned early without duplication",
			);
			return {
				paymentUrl: getPaymentUrlFromReference(invoice.duitkuReference),
				reference: invoice.duitkuReference,
				alreadyExists: true,
			};
		}

		const url = new URL(baseUrl);
		const merchantOrderId = formatInvoiceNumber(invoice);

		const { tenant, room } = invoice.lease;
		const payMonth = formatDate(invoice.dueDate, "MMM YYYY");

		// Forward our options down into the raw client SDK wrapper
		const result = await duitkuCreateInvoice(
			{
				paymentAmount: invoice.amount,
				merchantOrderId,
				productDetails: `Pembayaran Sewa Kamar ${room.roomNumber}`,
				customerVaName: tenant.fullName,
				phoneNumber: tenant.phoneNumber,
				itemDetails: [
					{
						name: `Sewa Kamar ${payMonth}`,
						price: invoice.amount,
						quantity: 1,
					},
				],
				customerDetail: {
					firstName: tenant.fullName,
					phoneNumber: tenant.phoneNumber.replace("628", "08"),
				},
				returnUrl: new URL("/api/duitku/redirect", url).href,
				callbackUrl: new URL("/api/duitku/callback", url).href,
				expiryPeriod: 60 * 24 * 14, // 2 weeks
				paymentMethod: "",
			},
			options,
		);

		await db
			.update(invoices)
			.set({ duitkuReference: result.reference })
			.where(eq(invoices.id, invoiceId));

		if (auditUserId) {
			await db.insert(auditLogs).values({
				userId: auditUserId,
				action: "UPDATE",
				tableName: "invoices",
				recordId: invoiceId,
				details: auditDetail.payment(
					`Generate tautan pembayaran Duitku: Ref ${result.reference} untuk ${tenant.fullName} (${room.roomNumber}) - ${formatCurrency(invoice.amount)}`,
					invoice.amount,
					result.reference,
				),
			});
		}

		return {
			paymentUrl: result.paymentUrl,
			reference: result.reference,
			alreadyExists: false,
		};
	} catch (error) {
		log?.error(
			{ error },
			"payment-service: initialization pipeline failed processing reference generation",
		);
		throw error;
	}
};
