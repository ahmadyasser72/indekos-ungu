# Rencana Implementasi Laporan PDF (puppeteer-core)

## 1. Ringkasan

Implementasi generate PDF laporan menggunakan `puppeteer-core` di package `site/`.
Layout mengacu wireframe `docs/wireframes/out.html`.
Tidak perlu server tambahan — puppeteer jalan di endpoint Astro.

---

## 2. Dependensi

```bash
cd site && bun add puppeteer-core
```

- `puppeteer-core` — lightweight, tanpa download browser.
- Tidak pakai `@puppeteer/browsers`. Browser dari sistem (`/usr/bin/chromium`).
- Tidak pakai `jszip` — download PDF langsung, bukan batch.

---

## 3. Environment

| Variabel        | Wajib? | Keterangan                                           |
| --------------- | ------ | ---------------------------------------------------- |
| `CHROMIUM_PATH` | Ya     | Path ke binary Chromium. Contoh: `/usr/bin/chromium` |

Jika `CHROMIUM_PATH` tidak di-set atau file tidak ditemukan, `generatePDF()` throw error.

> **Catatan:** URL untuk puppeteer pakai `Astro.url.origin` dari request `download.ts`, jadi tidak perlu env `SITE_BASE_URL`.

---

## 4. Struktur File

```
site/src/
├── layouts/
│   └── report-layout.astro          # [BARU] Layout kop + TTD, tailwind monochrome
├── lib/
│   ├── date.ts                      # SUDAH ADA - dayjs locale id
│   └── pdf.ts                       # [BARU] generatePDF({ url })
│   └── currency.ts                  # [BARU] formatCurrency(amount)
└── pages/
    ├── dashboard/
    │   ├── manage/
    │   │   ├── complaints/
    │   │   │   ├── index.astro      # SUDAH ADA
    │   │   │   └── report/
    │   │   │       ├── html.astro   # [BARU] Preview + data komplain
    │   │   │       └── download.ts  # [BARU] Endpoint PDF
    │   │   ├── tenants/
    │   │   │   ├── index.astro      # SUDAH ADA
    │   │   │   └── report/
    │   │   │       ├── html.astro   # [BARU] Daftar penghuni
    │   │   │       └── download.ts
    │   │   ├── rooms/
    │   │   │   ├── index.astro      # SUDAH ADA
    │   │   │   └── report/
    │   │   │       ├── html.astro   # [BARU] Rekap status kamar
    │   │   │       └── download.ts
    │   │   └── invoices/
    │   │       ├── index.astro      # SUDAH ADA
    │   │       └── report/
    │   │           ├── html.astro   # [BARU] Rekap tagihan per penghuni
    │   │           └── download.ts
    │   ├── report/
    │   │   ├── transactions/
    │   │   │   ├── index.astro      # SUDAH ADA (dashboard view)
    │   │   │   └── report/
    │   │   │       ├── html.astro   # [BARU] Laporan transaksi bulanan
    │   │   │       └── download.ts
    │   │   └── notifications/
    │   │       ├── index.astro      # SUDAH ADA (dashboard view)
    │   │       └── report/
    │   │           ├── html.astro   # [BARU] Laporan riwayat pengingat + notifikasi
    │   │           └── download.ts
    │   └── log/
    │       ├── audit/
    │       │   ├── index.astro      # SUDAH ADA
    │       │   └── report/
    │       │       ├── html.astro   # [BARU] Laporan interaksi user (audit log)
    │       │       └── download.ts
    │       └── chatbot/
    │           ├── index.astro      # SUDAH ADA
    │           └── report/
    │               ├── html.astro   # [BARU] Laporan interaksi penghuni (chatbot)
    │               └── download.ts
    └── invoice/
        ├── [id].astro               # SUDAH ADA (existing page)
        └── download.ts              # [BARU] Download invoice PDF
```

**Pola penamaan (konsisten):**

- `report/` — subfolder di setiap fitur (seperti `modal/`)
- `report/html.astro` — halaman HTML untuk dirender puppeteer + preview
- `report/download.ts` — endpoint `GET` yang spawn puppeteer dan kirim file PDF

---

## 5. Layout Laporan (`layouts/report-layout.astro`)

Layout untuk semua laporan formal. Monochrome, **tanpa daisyui**.

### Elemen:

```
┌─────────────────────────────────────────┐
│  [Logo]  KOST UNGU                      │  ← Kop (border-bottom 2px black)
│           Alamat lengkap                │
├─────────────────────────────────────────┤
│  JUDUL LAPORAN (underline)              │  ← Doc title
│  Periode: xxx                           │
├─────────────────────────────────────────┤
│  Slot konten (table, stat, dll)         │  ← <slot />
├─────────────────────────────────────────┤
│  Banjarbaru, 19 Juni 2026                │  ← TTD area (2 kolom grid)
│  Dibuat oleh         Diketahui oleh     │
│  ({createdBy})       ({knownBy})         │
│  ─────────────       ─────────────      │  ← border-top 2px
│  [Nama]              [Nama]             │
└─────────────────────────────────────────┘
```

### Detail CSS (tailwind utility-only):

- `font-serif` — font formal untuk dokumen cetak
- Warna: `text-black`, `border-black`, `bg-gray-100` (header table)
- Kop: `border-b-2 border-black pb-4 mb-6`
- Judul: `uppercase underline text-sm font-bold`
- Table: `border-collapse border border-black`, cell `border border-black p-2 text-[10px]`
- TTD: `grid grid-cols-2 gap-12 mt-12 text-center`

### Props layout:

```ts
interface Props {
	title: string; // Judul laporan
	subtitle?: string; // Periode / deskripsi
	createdBy: string; // Nama pembuat (dari Astro.locals.user)
	knownBy: string; // Nama pemilik (dari tabel users role=owner)
}
```

### Sumber data TTD:

| Kolom       | Sumber                                                                                 | Fallback        |
| ----------- | -------------------------------------------------------------------------------------- | --------------- |
| `createdBy` | `Astro.locals.user.displayName` (dikirim melalui query `?createdBy=` dari download.ts) | `"Staff"`       |
| `knownBy`   | Query `users` tabel filter `role = "owner"`, ambil `displayName`                       | `"Pemilik Kos"` |

**Kenapa `createdBy` dikirim melalui query?** Puppeteer navigasi ke `html.astro` sebagai request tanpa session. Jadi `download.ts` yang sudah authenticated membaca `Astro.locals.user` dan mengirimkannya sebagai query param ke `html.astro`.

**`knownBy` langsung query DB di `html.astro`** karena owner bersifat tetap dan tidak perlu auth.

---

## 6. Library

### `lib/pdf.ts` — Core PDF generator + reusable download handler

```ts
import fs from "node:fs";

import type { APIRoute } from "astro";
import { CHROMIUM_PATH } from "astro:env/server";
import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

interface GeneratePdfOptions {
	url: string;
}

// ── Browser singleton ──────────────────────────────────────────────────────

let browserInstance: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
	if (browserInstance?.connected) return browserInstance;
	if (browserPromise) return browserPromise;

	const chromiumPath = CHROMIUM_PATH;
	if (!fs.existsSync(chromiumPath))
		throw new Error(`Chromium not found at ${chromiumPath}`);

	browserPromise = puppeteer.launch({
		executablePath: chromiumPath,
		args: ["--no-sandbox", "--headless=new"],
	});

	browserInstance = await browserPromise;
	browserInstance.on("disconnected", () => {
		browserInstance = null;
		browserPromise = null;
	});

	return browserInstance;
}

// ── Shared auth token for puppeteer ────────────────────────────────────────

let pdfToken: string | null = null;

export function getPDFToken(): string {
	if (!pdfToken) {
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		pdfToken = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
			"",
		);
	}
	return pdfToken;
}

// ── Generate PDF ───────────────────────────────────────────────────────────

export async function generatePDF(opts: GeneratePdfOptions): Promise<Buffer> {
	const { url } = opts;

	const browser = await getBrowser();
	const page = await browser.newPage();

	try {
		await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: { top: "40mm", bottom: "30mm", left: "40mm", right: "30mm" },
		});

		return Buffer.from(pdf);
	} finally {
		await page.close();
	}
}

// ── Reusable download handler ──────────────────────────────────────────────

type PathResolver = string | ((reqUrl: URL) => string);

export function makeDownloadHandler(path: PathResolver): APIRoute {
	return async ({ url: reqUrl, locals }) => {
		const search = reqUrl.searchParams;
		const filename = (search.get("filename") ?? "laporan").replace(
			/[^a-zA-Z0-9_\-]/g,
			"_",
		);
		const createdBy = locals.user?.name ?? "Staff";

		// Pass auth token + user info ke target page (bypass middleware)
		search.set("_pdf_token", getPDFToken());
		search.set("createdBy", createdBy);

		const renderPath = typeof path === "function" ? path(reqUrl) : path;
		const pageUrl = `${reqUrl.origin}${renderPath}?${search.toString()}`;

		const pdfBuffer = await generatePDF({ url: pageUrl });

		return new Response(pdfBuffer as unknown as BodyInit, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}.pdf"`,
				"Content-Length": pdfBuffer.length.toString(),
			},
		});
	};
}
```

### `lib/currency.ts` — Format mata uang

```ts
export function formatCurrency(amount: number): string {
	return `Rp ${amount.toLocaleString("id-ID")}`;
}
```

> **Catatan:** Tidak perlu utility khusus — `toLocaleString("id-ID")` sudah handle. Tapi reusable function menjaga konsistensi format.

---

## 7. Pola `download.ts` — cukup 1 baris

Setiap `download.ts` sekarang tinggal panggil `makeDownloadHandler`:

```ts
import { makeDownloadHandler } from "~/lib/pdf";

export const GET = makeDownloadHandler(
	"/dashboard/manage/complaints/report/html",
);
```

Untuk invoice (dynamic route `[id]`):

```ts
import { makeDownloadHandler } from "~/lib/pdf";

// url.pathname = /invoice/123/download → hapus segment terakhir → /invoice/123
export const GET = makeDownloadHandler(
	(url) => url.pathname.replace(/\/[^/]+$/, ""),
);

### Yang dilakukan `makeDownloadHandler`:

1. Baca `locals.user.name` → set query param `createdBy`
2. Generate/set shared auth token → set query param `_pdf_token`
3. Forward semua query params dari request ke `html.astro`
4. Bangun URL lengkap dari `reqUrl.origin + path + ?searchParams`
5. Panggil `generatePDF({ url })`
6. Return Response dengan `Content-Disposition: attachment`

> **Auth bypass:** Middleware (`src/middleware.ts`) mengecek `_pdf_token`. Jika cocok dengan token dari `getPDFToken()`, middleware bypasses session check dan inject `locals.user` langsung dari query `createdBy`. Puppeteer tidak perlu session cookie — token in-memory aman karena random 48-char hex.

> **Browser singleton:** Browser diluncurkan sekali, dipakai ulang untuk semua PDF. `browser.newPage()` + `page.close()` per request. Jika browser disconnected (crash), auto re-launch di request berikutnya.

### Alur + TTD (2 fase):

**Fase 1 — Astro server (download.ts):**

```

User klik "Download PDF" (session authenticated)
↓
GET /.../report/download?status=open&filename=laporan
↓
makeDownloadHandler(path) — APIRoute:

1. baca locals.user.name → set query createdBy
2. generate/get shared PDF token → set query \_pdf_token
3. sanitasi filename
4. pageUrl = reqUrl.origin + path + ?searchParams
5. generatePDF({ url: pageUrl })
   ↓
   Pass URL + args ke puppeteer

```

**Fase 2 — Puppeteer headless (middleware bypass + render):**

```

puppeteer page.goto(pageUrl) → request masuk ke Astro middleware
↓
middleware.ts:

1. path starts with /dashboard
2. cek \_pdf_token di query param
3. cocok dengan token dari getPDFToken()? → YA
4. inject locals.user = { id: 0, name: createdBy, role: "staff" }
5. return next() → LANJUT tanpa session
   ↓
   html.astro (server-side render):

- createdBy dari query param (fallback "Staff")
- knownBy dari DB: users where role = "owner" (fallback "Pemilik Kos")
- query data laporan dari DB sesuai filter
- render HTML + <ReportLayout />
  ↓
  page.pdf() → Buffer
  ↓
  Response Content-Disposition attachment → browser user download

````

> **Mengapa pakai `page.goto` bukan `setContent`?** Karena `html.astro` adalah Astro page yang bisa dipreview langsung di browser. Tidak perlu fetch data terpisah — Astro handle query & render. `download.ts` cukup arahkan URL ke halaman tersebut.

---

## 8. Daftar Laporan

| #   | Fitur                  | Nama Laporan               | Letak                          |
| --- | ---------------------- | -------------------------- | ------------------------------ |
| 1   | Manage → Complaints    | Laporan Komplain           | `manage/complaints/report/`    |
| 2   | Manage → Tenants       | Daftar Penghuni Aktif      | `manage/tenants/report/`       |
| 3   | Manage → Rooms         | Rekap Status Kamar         | `manage/rooms/report/`         |
| 4   | Manage → Invoices      | Rekap Tagihan Per Penghuni | `manage/invoices/report/`      |
| 5   | Report → Transactions  | Laporan Transaksi Bulanan  | `report/transactions/report/`  |
| 6   | Report → Notifications | Laporan Riwayat Pengingat  | `report/notifications/report/` |
| 7   | Log → Audit            | Laporan Interaksi User     | `log/audit/report/`            |
| 8   | Log → Chatbot          | Laporan Interaksi Penghuni | `log/chatbot/report/`          |
| 9   | Invoice                | Struk Invoice Digital      | `invoice/download.ts`          |

---

## 9. Isi Setiap Laporan

Kolom diselaraskan dengan `index.astro` masing-masing. Istilah pakai Bahasa Indonesia baku.

### 9.1. Manage → Complaints — Laporan Komplain

- **Data dari `complaints/index.astro`:** ID (KMP-xxx), Deskripsi, Status, Kamar, Penghuni, Tanggal Lapor, Ditangani Oleh
- **Tabel:** No, Penghuni, Kamar, Deskripsi, Status, Tanggal Lapor, Tanggal Selesai, Ditangani Oleh
- **Filter query:** `status`, `from`, `to`

### 9.2. Manage → Tenants — Daftar Penghuni Aktif

- **Data dari `tenants/index.astro`:** Nama, No. HP, Kamar, Awal Sewa, Akhir Sewa, Status
- **Tabel:** No, Nama Lengkap, No. HP, Kamar, Awal Sewa, Akhir Sewa, Status
- **Footer:** Total penghuni
- **Filter:** `status` (aktif/selesai/semua)

### 9.3. Manage → Rooms — Rekap Status Kamar

- **Data dari `rooms/index.astro`:** No. Kamar, Tipe Kamar, Harga Sewa, Status (Terisi/Kosong/Nonaktif), Penghuni
- **Stat:** Total Kamar, Terisi, Tersedia, Nonaktif
- **Tabel:** No. Kamar, Tipe Kamar, Harga per Bulan, Status, Penghuni
- **Filter:** `status` (terisi/kosong/nonaktif), `type` (Standar/Premium)

### 9.4. Manage → Invoices — Rekap Tagihan Per Penghuni

- **Data dari `report/transactions/index.astro`:** No. Invoice, Penghuni, Kamar, Nominal, Jatuh Tempo, Status, Ref. Gateway
- **Data penghuni:** Nama, Kamar, Periode Tinggal
- **Tabel:** No. Invoice, Periode, Nominal, Jatuh Tempo, Status
- **Footer:** Total Tagihan, Total Lunas, Total Belum Lunas
- **Filter:** `tenantId` (required — generate per penghuni)

### 9.5. Report → Transactions — Laporan Transaksi Bulanan

- **Data dari `report/transactions/index.astro`:** No. Invoice, Penghuni, Kamar, Nominal, Jatuh Tempo, Status, Ref. Gateway
- **Stat:** Total Pemasukan, Sudah Terbayar, Belum Terbayar
- **Tabel:** No. Invoice, Penghuni, Kamar, Nominal, Jatuh Tempo, Status, Ref. Gateway
- **Filter:** `month`, `status`

### 9.6. Report → Notifications — Laporan Notifikasi

- **Data dari `report/notifications/index.astro`:** Waktu Kirim, Penghuni, No. Invoice, Tipe, Status
- **Tabel:** Waktu Kirim, Penghuni, No. Invoice, Jenis, Status
- **Filter:** `from`, `to`, `type`

### 9.7. Log → Audit — Laporan Aktivitas Pengguna

- **Data dari `log/audit/index.astro`:** Waktu Kejadian, Pengguna, Jenis Aksi, Tabel Target, ID Record
- **Data pengguna:** Nama, Role
- **Tabel:** Waktu Kejadian, Pengguna, Jenis Aksi, Tabel, ID Record
- **Filter:** `userId`, `from`, `to`, `action`

### 9.8. Log → Chatbot — Laporan Percakapan Chatbot

- **Data dari `log/chatbot/index.astro`:** Waktu, Penghuni (dengan Kamar), Arah (Masuk/Keluar), Isi Pesan
- **Data penghuni:** Nama, Kamar
- **Tabel:** Waktu, Penghuni, Kamar, Arah, Isi Pesan
- **Filter:** `tenantId`, `from`, `to`, `direction`

### 9.9. Invoice — Struk Invoice Digital

- **Layout:** Kartu invoice (existing `[id].astro`), konversi PDF via puppeteer
- **Endpoint:** `invoice/download.ts` — pakai `makeDownloadHandler` dengan function resolver stripping segment terakhir dari path
  ```ts
  export const GET = makeDownloadHandler(
  	(url) => url.pathname.replace(/\/[^/]+$/, ""),
  );
````

---

## 10. Query Parameter Pattern

Semua `html.astro` menerima query params untuk filter. `download.ts` (via `makeDownloadHandler`) **forward** query params dari request user ke `html.astro`, plus tambahan `createdBy` dan `_pdf_token` (auth bypass). Contoh:

```
User request:
  GET /dashboard/manage/complaints/report/download?status=open&from=2026-01-01&to=2026-06-30

makeDownloadHandler:
  const search = url.searchParams;        // bawa semua query params
  search.set("_pdf_token", getPDFToken());  // auth bypass (middleware)
  search.set("createdBy", createdBy);       // nama pembuat
  const pageUrl = `${reqUrl.origin}${path}?${search.toString()}`;
  // → forward status, from, to, _pdf_token, createdBy ke html.astro

Middleware:
  cek _pdf_token === getPDFToken() → bypass session, inject locals.user

Di html.astro:
  const params = Astro.locals.parseQuery(z.object({...}));
  // query DB sesuai filter
```

---

## 11. Implementasi Bertahap

### Tahap 1 — Foundation

1.  `lib/pdf.ts` — `generatePDF()` + `makeDownloadHandler()`
2.  `lib/currency.ts` — `formatCurrency()`
3.  `layouts/report-layout.astro` — layout kop + TTD

### Tahap 2 — Pilot (1 laporan)

4.  `manage/complaints/report/html.astro` — query + render
5.  `manage/complaints/report/download.ts` — 1 baris `makeDownloadHandler(...)`
6.  Test: `curl 'http://localhost:4321/dashboard/manage/complaints/report/download?status=open&filename=laporan-komplain' -o laporan-komplain.pdf`

### Tahap 3 — Semua laporan

7.  Implementasi `html.astro` + `download.ts` (1 baris) untuk sisa 7 laporan

### Tahap 4 — Invoice

8.  `invoice/download.ts` — 1 baris, pakai function resolver:
    ```ts
    export const GET = makeDownloadHandler((url) =>
    	url.pathname.replace(/\/[^/]+$/, ""),
    );
    ```

---

## 12. Catatan Penting

- **Monochrome:** Hanya hitam, putih, dan grayscale. Tidak ada warna aksen.
- **Tailwind only:** Tidak ada class daisyui di layout laporan.
- **Table borders:** `border border-black` untuk cell, `bg-gray-100` untuk header.
- **Font size:** `text-[10px]` untuk isi table, `text-xs` untuk label, `text-sm` untuk judul.
- **Kop:** Nama kos + alamat lengkap (hardcode di layout).
- **TTD:** 2 kolom — "Dibuat oleh" (nama dari `createdBy` prop) dan "Diketahui oleh" (nama dari `knownBy` prop).
  - `createdBy` berasal dari query param (`?createdBy=...`) yang diset `download.ts` dari `locals.user.name`.
  - `knownBy` di-query langsung di `html.astro` dari tabel `users` dimana `role = "owner"`.
  - Tanggal diisi otomatis pakai `dayjs().format("DD MMMM YYYY")`.
- **Format PDF:** A4 portrait (semua laporan).
- **Margin:** Surat resmi — atas 40mm, kiri 40mm, bawah 30mm, kanan 30mm.
- **`page.goto`** dengan `waitUntil: "networkidle0"` — pastikan CSS/Astro render selesai sebelum PDF.
- **Auth bypass:** Puppeteer tidak punya session cookie. `download.ts` set query param `_pdf_token` (random 48-char hex). Middleware cek token → inject `locals.user` tanpa perlu redirect ke login.
- **Browser singleton:** Browser Chromium diluncurkan sekali (`getBrowser()`). Tidak launch/close per request. Jika crash, auto re-launch.
- **`makeDownloadHandler` reusable** — semua `download.ts` cukup 1 baris panggil fungsi ini. Tidak ada duplikasi kode.
- **Tidak perlu endpoint API khusus** — `makeDownloadHandler` return `APIRoute`, langsung export sebagai `GET`.
- **`CHROMIUM_PATH`** dari `astro:env/server` (schema required). Jika binary tidak ada di path tsb, `generatePDF` throw error.

---

## 13. Status Implementasi

Rencana di atas telah diimplementasikan sepenuhnya. Semua 9 laporan PDF telah berfungsi, termasuk struk invoice digital. Pola `makeDownloadHandler()` telah digunakan secara konsisten di seluruh endpoint download. Autentikasi puppeteer via token in-memory dan browser singleton telah berfungsi sebagaimana dirancang.
