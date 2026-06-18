import { createHmac } from "node:crypto";

// ─── DuitkuConfig ──────────────────────────────────────────────────
export interface DuitkuConfig {
	merchantCode: string;
	apiKey: string;
	baseUrl: string;
}

export function config(): DuitkuConfig {
	const {
		DUITKU_MERCHANT_CODE,
		DUITKU_API_KEY,
		DUITKU_BASE_URL = "https://api-sandbox.duitku.com",
	} = process.env;

	if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY)
		throw new Error("DUITKU_MERCHANT_CODE and DUITKU_API_KEY is not set.");

	return {
		merchantCode: DUITKU_MERCHANT_CODE,
		apiKey: DUITKU_API_KEY,
		baseUrl: DUITKU_BASE_URL,
	};
}

// ─── DuitkuError ───────────────────────────────────────────────────
export class DuitkuError extends Error {
	code: string;
	constructor(code: string, message: string) {
		super(message);
		this.name = "DuitkuError";
		this.code = code;
	}
}

// ─── Types ─────────────────────────────────────────────────────────
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

// ─── Signature ─────────────────────────────────────────────────────
export function generateSignature(
	merchantCode: string,
	timestamp: string,
	apiKey: string,
): string {
	return createHmac("sha256", apiKey)
		.update(merchantCode + timestamp)
		.digest("hex");
}

export function verifyCallbackSignature(
	merchantCode: string,
	amount: number,
	merchantOrderId: string,
	signature: string,
	apiKey: string,
): boolean {
	const stringToSign = merchantCode + amount + merchantOrderId;
	const calculated = createHmac("sha256", apiKey)
		.update(stringToSign)
		.digest("hex");
	return calculated === signature;
}

// ─── Create Invoice ────────────────────────────────────────────────
export async function createInvoice(
	params: CreateInvoiceParams,
): Promise<CreateInvoiceResponse> {
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

	let res: Response;
	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-duitku-timestamp": timestamp,
				"x-duitku-signature": signature,
				"x-duitku-merchantcode": merchantCode,
			},
			body: JSON.stringify(body),
		});
	} catch (err) {
		throw new DuitkuError(
			"NETWORK_ERROR",
			`Gagal terhubung ke Duitku: ${(err as Error).message}`,
		);
	}

	const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

	if (!res.ok) {
		const msg = String(
			json?.StatusMessage ?? json?.statusMessage ?? `HTTP ${res.status}`,
		);
		const code = String(
			json?.StatusCode ?? json?.statusCode ?? `HTTP_${res.status}`,
		);
		throw new DuitkuError(code, `Duitku API error: ${msg}`);
	}

	return {
		reference: String(json.Reference ?? json.reference ?? ""),
		paymentUrl: String(json.PaymentUrl ?? json.paymentUrl ?? ""),
		statusCode: String(json.StatusCode ?? json.statusCode ?? ""),
		statusMessage: String(json.StatusMessage ?? json.statusMessage ?? ""),
		merchantCode: String(json.MerchantCode ?? json.merchantCode ?? ""),
		currency: String(json.Currency ?? json.currency ?? ""),
		totalAmount: Number(json.TotalAmount ?? json.totalAmount ?? 0),
	};
}
