import fs from "node:fs";
import { createLogger } from "@indekos/utilities/logger";

import type { APIRoute } from "astro";
import { CHROMIUM_PATH } from "astro:env/server";
import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

const logger = createLogger("site-puppeteer");

let browserInstance: Browser | null = null;
const getBrowser = async () => {
	if (browserInstance?.connected) {
		logger.debug("browser: reusing existing instance");
		return browserInstance;
	}

	if (!fs.existsSync(CHROMIUM_PATH)) {
		logger.fatal(
			{ path: CHROMIUM_PATH },
			"browser: initialization aborted. Chromium binary missing",
		);
		throw new Error(`Chromium not found at ${CHROMIUM_PATH}`);
	}

	const startTime = performance.now();

	browserInstance = await puppeteer.launch({
		executablePath: CHROMIUM_PATH,
		args: ["--no-sandbox", "--headless=new"],
	});

	const duration = performance.now() - startTime;
	logger.info(
		{ durationMs: Math.round(duration) },
		"browser: launched successfully",
	);

	browserInstance.on("disconnected", () => {
		logger.warn("browser: process disconnected unexpectedly or shut down");
		browserInstance = null;
	});
	return browserInstance;
};

let pdfToken: string | null = null;
export const getPuppeteerToken = () => {
	if (import.meta.env.DEV) return "dev-pdf-token";

	if (!pdfToken) {
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		pdfToken = Array.from(bytes, (byte) =>
			byte.toString(16).padStart(2, "0"),
		).join("");
	}

	return pdfToken;
};

const generatePDF = async (url: string) => {
	const startTime = performance.now();

	let browser: Browser;
	try {
		browser = await getBrowser();
	} catch (error) {
		logger.error({ error, url }, "pdf: failed to acquire browser process");
		throw error;
	}

	const page = await browser.newPage();
	await page.setExtraHTTPHeaders({ "x-puppeteer": getPuppeteerToken() });

	try {
		await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
			preferCSSPageSize: true,
		});

		const duration = performance.now() - startTime;

		logger.info(
			{ url, durationMs: Math.round(duration), sizeBytes: pdf.length },
			"pdf: generated successfully",
		);
		return Buffer.from(pdf);
	} catch (error) {
		const duration = performance.now() - startTime;

		logger.error(
			{ url, durationMs: Math.round(duration), error },
			"pdf: generation failed",
		);
		throw error;
	} finally {
		await page.close();
	}
};

export const makeDownloadHandler = (
	path: string | ((url: URL) => string),
	filename: string | ((url: URL) => string) = "laporan",
): APIRoute => {
	return async ({ url, locals }) => {
		const userId = locals.user?.id;

		if (!userId) {
			logger.error(
				{ url: url.pathname },
				"download-handler: unauthorized endpoint access attempt",
			);
			return new Response("Unauthorized", { status: 401 });
		}

		const search = url.searchParams;
		search.set("user", userId.toString());

		const renderPath = typeof path === "function" ? path(url) : path;
		const pageUrl = `${url.origin}${renderPath}?${search.toString()}`;

		try {
			const pdf = await generatePDF(pageUrl);
			const baseName =
				typeof filename === "function" ? filename(url) : filename;
			const dateStr = new Date().toISOString().slice(0, 10);
			const safeName = `${baseName}_${dateStr}`.replace(
				/[^a-zA-Z0-9_\-]/g,
				"_",
			);

			return new Response(pdf, {
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="${safeName}.pdf"`,
					"Content-Length": pdf.length.toString(),
				},
			});
		} catch (error) {
			logger.error(
				{ userId, pageUrl, error },
				"download-handler: internal route execution exception",
			);
			return new Response("Failed to generate report", { status: 500 });
		}
	};
};
