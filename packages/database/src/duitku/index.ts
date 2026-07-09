import { createHmac } from "node:crypto";
import type { Logger } from "@indekos/utilities/logger";

export interface DuitkuConfig {
	merchantCode: string;
	apiKey: string;
	baseUrl: string;
}

export interface DuitkuExecutionOptions {
	/** An optional, request-scoped child logger instance passed down from the runtime layer. */
	logger?: Logger;
}

export const config = (): DuitkuConfig => {
	const {
		DUITKU_MERCHANT_CODE,
		DUITKU_API_KEY,
		DUITKU_BASE_URL = "https://api-sandbox.duitku.com",
	} = process.env;

	if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
		throw new Error("DUITKU_MERCHANT_CODE and DUITKU_API_KEY is not set.");
	}

	return {
		merchantCode: DUITKU_MERCHANT_CODE,
		apiKey: DUITKU_API_KEY,
		baseUrl: DUITKU_BASE_URL,
	};
};

export class DuitkuError extends Error {
	code: string;
	constructor(code: string, message: string) {
		super(message);
		this.name = "DuitkuError";
		this.code = code;
	}
}

export interface CreateInvoiceParams {
	paymentAmount: number;
	merchantOrderId: string;
	productDetails: string;
	customerVaName: string;
	email?: string;
	phoneNumber: string;
	itemDetails: Array<{ name: string; price: number; quantity: number }>;
	customerDetail: { firstName: string; phoneNumber: string };
	returnUrl: string;
	callbackUrl: string;
	expiryPeriod: number;
	paymentMethod?: string;
}

export interface CreateInvoiceResponse {
	reference: string;
	paymentUrl: string;
	statusCode: string;
	statusMessage: string;
	merchantCode: string;
	currency: string;
	totalAmount: number;
}

export const generateSignature = (
	merchantCode: string,
	timestamp: string,
	apiKey: string,
): string => {
	return createHmac("sha256", apiKey)
		.update(merchantCode + timestamp)
		.digest("hex");
};

export const verifyCallbackSignature = (
	merchantCode: string,
	amount: number,
	merchantOrderId: string,
	signature: string,
	apiKey: string,
): boolean => {
	const stringToSign = merchantCode + amount + merchantOrderId;
	const calculated = createHmac("sha256", apiKey)
		.update(stringToSign)
		.digest("hex");
	return calculated === signature;
};

/** Derive payment redirect URL from Duitku reference. */
export const getPaymentUrlFromReference = (reference: string): string => {
	const baseUrl =
		process.env.DUITKU_BASE_URL ?? "https://api-sandbox.duitku.com";
	const appUrl = baseUrl.replace("api", "app");
	return `${appUrl}/redirect_checkout?reference=${reference}`;
};

export const createInvoice = async (
	params: CreateInvoiceParams,
	options?: DuitkuExecutionOptions,
): Promise<CreateInvoiceResponse> => {
	const log = options?.logger?.child({
		module: "database:duitku:createInvoice",
	});

	const { merchantCode, apiKey, baseUrl } = config();
	const timestamp = Date.now().toString();
	const signature = generateSignature(merchantCode, timestamp, apiKey);

	const body = {
		merchantCode,
		paymentAmount: params.paymentAmount,
		merchantOrderId: params.merchantOrderId,
		productDetails: params.productDetails,
		customerVaName: params.customerVaName,
		email: params.email ?? "",
		phoneNumber: params.phoneNumber,
		itemDetails: params.itemDetails,
		customerDetail: params.customerDetail,
		returnUrl: params.returnUrl,
		callbackUrl: params.callbackUrl,
		expiryPeriod: params.expiryPeriod,
		paymentMethod: params.paymentMethod ?? "",
	};

	const url = `${baseUrl}/api/merchant/createInvoice`;

	let response: Response;
	try {
		log?.info(
			{ merchantOrderId: params.merchantOrderId },
			"duitku-client: dispatching gateway payload creation request",
		);
		response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-duitku-timestamp": timestamp,
				"x-duitku-signature": signature,
				"x-duitku-merchantcode": merchantCode,
			},
			body: JSON.stringify(body),
		});
	} catch (error) {
		log?.error(
			{ error, merchantOrderId: params.merchantOrderId },
			"duitku-client: core network connection failure encountered",
		);
		throw new DuitkuError(
			"NETWORK_ERROR",
			`Gagal terhubung ke Duitku: ${(error as Error).message}`,
		);
	}

	const json = (await response.json().catch(() => ({}))) as Record<
		string,
		unknown
	>;

	if (!response.ok) {
		const message = String(
			json?.StatusMessage ?? json?.statusMessage ?? `HTTP ${response.status}`,
		);
		const code = String(
			json?.StatusCode ?? json?.statusCode ?? `HTTP_${response.status}`,
		);

		log?.error(
			{ responseCode: code, responseMessage: message },
			"duitku-client: vendor endpoint returned an operational error code",
		);
		throw new DuitkuError(code, `Duitku API error: ${message}`);
	}

	log?.info(
		{ reference: String(json.Reference ?? "") },
		"duitku-client: transaction invoice token generated successfully",
	);

	return {
		reference: String(json.Reference ?? json.reference ?? ""),
		paymentUrl: String(json.PaymentUrl ?? json.paymentUrl ?? ""),
		statusCode: String(json.StatusCode ?? json.statusCode ?? ""),
		statusMessage: String(json.StatusMessage ?? json.statusMessage ?? ""),
		merchantCode: String(json.MerchantCode ?? json.merchantCode ?? ""),
		currency: String(json.Currency ?? json.currency ?? ""),
		totalAmount: Number(json.TotalAmount ?? json.totalAmount ?? 0),
	};
};
