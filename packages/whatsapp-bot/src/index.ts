import { db } from "@e-kos/database";
import { auditLogs, chatbotMessages, tenants } from "@e-kos/database/schema";

import { DisconnectReason, makeWASocket } from "baileys";

import { useSqliteAuthState } from "./auth";
import { checkBills } from "./commands/check-bills";
import { checkComplaint } from "./commands/check-complaint";
import { help } from "./commands/help";
import { listComplaints } from "./commands/list-complaints";
import { paymentHistory } from "./commands/payment-history";
import { submitComplaint } from "./commands/submit-complaint";
import { tenantInfo } from "./commands/tenant-info";
import { pollResolvedComplaints } from "./polls/complaints";
import { pollNotifications } from "./polls/notifications";

interface PendingMessage {
	tenant: typeof tenants.$inferSelect;
	text: string;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingMessages = new Map<string, PendingMessage>();
let lastSendTime = 0;
let botUserId: number;

async function sendWithRateLimit(
	sock: ReturnType<typeof makeWASocket>,
	jid: string,
	content: { text: string },
) {
	const now = Date.now();
	const elapsed = now - lastSendTime;

	if (elapsed < 1_000) {
		await new Promise((r) => setTimeout(r, 1_000 - elapsed));
	}

	await sock.sendMessage(jid, content);
	lastSendTime = Date.now();
}

export async function main() {
	const botUser = await db.query.users.findFirst({
		where: { username: "bot-wa" },
	});

	if (!botUser) {
		console.error(
			"[Bot] User 'bot-wa' not found. Run `bun run db:seed` first.",
		);
		process.exit(1);
	}

	botUserId = botUser.id;

	const { state, saveCreds } = await useSqliteAuthState();

	// Cek apakah sudah login WhatsApp
	if (!state.creds.me) {
		console.error(
			"[Bot] WhatsApp belum login. Jalankan 'bun login' atau 'bun run login' dulu.",
		);
		process.exit(1);
	}

	const sock = makeWASocket({
		auth: state,
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
		if (connection === "close") {
			const shouldReconnect =
				(lastDisconnect?.error as any)?.output?.statusCode !==
				DisconnectReason.loggedOut;
			if (shouldReconnect) main();
		} else if (connection === "open") {
			console.log("[Bot] WhatsApp connected");
		}
	});

	// ─── Handle incoming WhatsApp messages ─────────────────────
	sock.ev.on("messages.upsert", async ({ messages }) => {
		for (const message of messages) {
			if (message.key.fromMe) continue;

			const jid = message.key.remoteJid;
			if (!jid?.endsWith("@s.whatsapp.net")) continue;

			const phone = jid.replace("@s.whatsapp.net", "");
			const text = message.message?.conversation?.trim() || "";
			if (!text) continue;

			// Cari tenant berdasarkan nomor
			const tenant = await db.query.tenants.findFirst({
				where: { phoneNumber: phone },
			});

			if (!tenant) {
				// Nomor tidak dikenal — debounce 10 detik
				const existing = debounceTimers.get(jid);
				if (existing) clearTimeout(existing);

				debounceTimers.set(
					jid,
					setTimeout(async () => {
						debounceTimers.delete(jid);

						await sendWithRateLimit(sock, jid, {
							text: "Maaf, nomor Anda tidak terdaftar sebagai penghuni kos. Silakan hubungi admin untuk informasi lebih lanjut.",
						});

						await db.insert(auditLogs).values({
							userId: botUserId,
							action: "REJECT",
							tableName: "chatbot_messages",
							details: `Menolak pesan dari nomor tidak terdaftar: ${phone}`,
						});
					}, 10_000),
				);

				continue;
			}

			// Simpan pesan masuk segera
			await db.insert(chatbotMessages).values({
				tenantId: tenant.id,
				direction: "incoming",
				message: text,
			});

			// Tenant dikenal — debounce 5 detik, simpan pesan terbaru
			pendingMessages.set(jid, { tenant, text });

			const existing = debounceTimers.get(jid);
			if (existing) clearTimeout(existing);

			debounceTimers.set(
				jid,
				setTimeout(async () => {
					debounceTimers.delete(jid);

					const data = pendingMessages.get(jid);
					pendingMessages.delete(jid);
					if (!data) return;

					// Proses perintah
					const responseText = await processCommand(
						data.tenant,
						data.text,
						botUserId,
					);

					// Simpan pesan keluar
					await db.insert(chatbotMessages).values({
						tenantId: data.tenant.id,
						direction: "outgoing",
						message: responseText,
					});

					// Catat interaksi ke audit log
					await db.insert(auditLogs).values({
						userId: botUserId,
						action: "INSERT",
						tableName: "chatbot_messages",
						details: `Bot merespons pesan dari tenant #${data.tenant.id} (${data.tenant.phoneNumber}): "${data.text.slice(0, 80)}"`,
					});

					// Kirim respons (rate limited: maks 1 pesan/detik)
					await sendWithRateLimit(sock, jid, { text: responseText });
				}, 5_000),
			);
		}
	});

	// ─── Polling tiap 30 detik ─────────────────────────────────
	setInterval(async () => {
		await pollNotifications(sock, botUserId);
		await pollResolvedComplaints(sock, botUserId);
	}, 30_000);

	console.log("[Bot] WhatsApp bot started");
}

// ─── Command processor ──────────────────────────────────────
async function processCommand(
	tenant: typeof tenants.$inferSelect,
	text: string,
	botUserId: number,
): Promise<string> {
	const lower = text.toLowerCase().trim();

	if (lower === "help") {
		return help();
	}

	const komplainkuMatch = lower.match(/^komplainku(?: (\d+))?$/);
	if (komplainkuMatch) {
		const id = komplainkuMatch[1];
		if (id) return checkComplaint(tenant, Number(id));
		return listComplaints(tenant);
	}

	if (lower === "komplain" || lower.startsWith("komplain ")) {
		return submitComplaint(tenant, text, botUserId);
	}

	if (lower === "tagihan") {
		return checkBills(tenant);
	}

	if (lower === "riwayat") {
		return paymentHistory(tenant);
	}

	if (lower === "info") {
		return tenantInfo(tenant);
	}

	return help();
}
