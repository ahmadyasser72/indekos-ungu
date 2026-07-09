import { beforeAll, describe, expect, it } from "bun:test";
import { createHmac } from "node:crypto";

import {
	config,
	DuitkuError,
	generateSignature,
	getPaymentUrlFromReference,
	verifyCallbackSignature,
} from "../index";

beforeAll(() => {
	process.env.DUITKU_MERCHANT_CODE = "TST";
	process.env.DUITKU_API_KEY = "abc123";
	process.env.DUITKU_BASE_URL = "https://api-sandbox.duitku.com";
});

describe("config", () => {
	it("returns config from env", () => {
		const c = config();
		expect(c.merchantCode).toBe("TST");
		expect(c.apiKey).toBe("abc123");
		expect(c.baseUrl).toBe("https://api-sandbox.duitku.com");
	});
});

describe("generateSignature", () => {
	it("returns 64-char hex string", () => {
		const sig = generateSignature("M1", "123", "key1");
		expect(sig).toMatch(/^[a-f0-9]{64}$/);
	});

	it("different inputs produce different signatures", () => {
		const a = generateSignature("M1", "123", "key1");
		const b = generateSignature("M2", "123", "key1");
		expect(a).not.toBe(b);
	});
});

describe("verifyCallbackSignature", () => {
	it("returns true for valid signature", () => {
		const expected = createHmac("sha256", "key")
			.update("MCODE10000ORD1")
			.digest("hex");
		expect(
			verifyCallbackSignature("MCODE", 10000, "ORD1", expected, "key"),
		).toBeTrue();
	});

	it("returns false for invalid signature", () => {
		expect(
			verifyCallbackSignature("MCODE", 100, "ORD", "bad", "key"),
		).toBeFalse();
	});
});

describe("getPaymentUrlFromReference", () => {
	it("derives payment URL from reference", () => {
		const url = getPaymentUrlFromReference("REF123");
		expect(url).toBe(
			"https://app-sandbox.duitku.com/redirect_checkout?reference=REF123",
		);
	});
});

describe("DuitkuError", () => {
	it("extends Error with code property", () => {
		const error = new DuitkuError("ERR01", "test error");
		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("DuitkuError");
		expect(error.code).toBe("ERR01");
		expect(error.message).toBe("test error");
	});
});
