#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync } from "fs";
import { dirname, join, relative } from "path";

import puppeteer from "puppeteer-core";

const CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
const root = process.cwd();
const src = join(root, "docs/wireframe-v2");
const out = join(root, "docs/wireframe-v2/png");

const htmlFiles = [];
for (const dir of ["input", "output"]) {
	const dirPath = join(src, dir);
	if (!existsSync(dirPath)) continue;
	for (const f of readdirSync(dirPath)) {
		if (f.endsWith(".html")) htmlFiles.push(join(dirPath, f));
	}
}

let ok = 0,
	fail = 0;
const browser = await puppeteer.launch({
	executablePath: CHROMIUM_PATH,
	args: ["--no-sandbox", "--headless=new"],
});

try {
	for (const file of htmlFiles) {
		const rel = relative(src, file).replace(/\.html$/, ".png");
		const outPath = join(out, rel);
		mkdirSync(dirname(outPath), { recursive: true });

		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
		try {
			await page.goto("file://" + file, { waitUntil: "networkidle0" });

			const name = file.toLowerCase();
			let el;
			if (name.includes("laporan")) el = ".report-paper";
			else if (name.includes("invoice")) el = ".invoice-card";
			else if (name.includes("login")) el = "body > .card";
			else el = ".max-w-6xl";

			const elHandle = await page.$(el);
			if (!elHandle) {
				console.error("✗ no match:", rel);
				fail++;
				continue;
			}
			const box = await elHandle.boundingBox();
			if (!box) {
				console.error("✗ no box:", rel);
				fail++;
				continue;
			}

			const pad = 10;
			await page.screenshot({
				path: outPath,
				clip: {
					x: Math.max(0, box.x - pad),
					y: Math.max(0, box.y - pad),
					width: box.width + pad * 2,
					height: box.height + pad * 2,
				},
			});
			console.log("✓", rel);
			ok++;
		} finally {
			await page.close();
		}
	}
} finally {
	await browser.close();
}

console.log(`\nDone — ${ok} OK, ${fail} fail → ${out}/`);
