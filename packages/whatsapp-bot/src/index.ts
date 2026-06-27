import { db, eq } from "@e-kos/database";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	tenants,
} from "@e-kos/database/schema";

import { makeWASocket } from "baileys";
import pino from "pino";
import pinoPretty from "pino-pretty";

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
const unknownCooldowns = new Map<string, number>();
let lastSendTime = 0;

const sendWithRateLimit = async (
	sock: ReturnType<typeof makeWASocket>,
	jid: string,
	content: { text: string },
) => {
	const now = Date.now();
	const elapsed = now - lastSendTime;

	if (elapsed < 1_000) {
		const wait = 1_000 - elapsed;
		console.warn("rate limit: waiting %d ms before next send", wait);
		await Bun.sleep(wait);
	}

	await sock.sendMessage(jid, content);
	lastSendTime = Date.now();
};

export const main = async () => {
	const botUser = await db.query.users.findFirst({
		where: { username: "bot-wa" },
	});

	if (!botUser) {
		console.error("User 'bot-wa' not found. Run `bun run db:seed` first.");
		process.exit(1);
	}

	const botUserId = botUser.id;

	const { state, saveCreds } = await useSqliteAuthState();

	if (!state.creds.me) {
		console.error("WhatsApp belum login.");
		process.exit(1);
	}

	const logDir = process.env.LOG_PATH ?? "./logs";

	const sock = makeWASocket({
		auth: state,
		logger: pino(
			{ name: "whatsapp-bot" },
			pino.multistream([
				{ level: "info", stream: pinoPretty() },
				{ level: "info", stream: pino.destination(`${logDir}/bot.log`) },
			]),
		),
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
		if (connection === "open") {
			console.log("WhatsApp connected");
		} else {
			console.warn("connection status: %s", connection);
			if (lastDisconnect?.error) {
				console.error("disconnect error:", lastDisconnect.error);
			}
		}
	});

	sock.ev.on("messages.upsert", async ({ messages }) => {
		for (const message of messages) {
			if (message.key.fromMe) continue;

			const jid = message.key.remoteJidAlt;
			if (!jid?.endsWith("@s.whatsapp.net")) continue;

			const text = message.message?.conversation?.trim() || "";
			if (!text) continue;

			const lower = text.toLowerCase().trim();
			const phone = jid.replace("@s.whatsapp.net", "");
			const tenant = await db.query.tenants.findFirst({
				where: { phoneNumber: phone },
			});

			if (!tenant) {
				// Nomor tidak dikenal — cooldown 30 detik per nomor
				const cooldownUntil = unknownCooldowns.get(jid);
				if (cooldownUntil && Date.now() < cooldownUntil) {
					continue;
				}

				await sendWithRateLimit(sock, jid, {
					text: "Maaf, nomor Anda tidak terdaftar sebagai penghuni kos. Silakan hubungi admin untuk informasi lebih lanjut.",
				});

				// Cooldown 30 detik sebelum bisa reply nomor yg sama lagi
				unknownCooldowns.set(jid, Date.now() + 30_000);

				await db.insert(auditLogs).values({
					userId: botUserId,
					action: "REJECT",
					tableName: "chatbot_messages",
					details: auditDetail.reject(
						`Menolak pesan dari nomor tidak terdaftar: ${phone}`,
						"unregistered_number",
					),
				});

				continue;
			}

			await db.insert(chatbotMessages).values({
				tenantId: tenant.id,
				direction: "incoming",
				message: text,
			});

			// Tenant belum verifikasi — cek konfirmasi "YA"
			if (!tenant.isVerified) {
				if (lower === "ya") {
					await db
						.update(tenants)
						.set({ isVerified: true })
						.where(eq(tenants.id, tenant.id));

					await sendWithRateLimit(sock, jid, {
						text: `*✅ Verifikasi Berhasil!*\n\nHalo *${tenant.fullName}*! Akun Anda telah aktif.\n\nKetik *help* untuk melihat daftar perintah yang tersedia.`,
					});
				} else {
					await sendWithRateLimit(sock, jid, {
						text: `*⚠️ Akun Belum Aktif*\n\nHalo *${tenant.fullName}*! Anda belum melakukan verifikasi.\n\nSilakan balas pesan selamat datang dengan kata *YA* untuk mengaktifkan akun Anda.`,
					});
				}
				continue;
			}

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

					try {
						const responseText = await processCommand(data.tenant, data.text);

						await db.insert(chatbotMessages).values({
							tenantId: data.tenant.id,
							direction: "outgoing",
							message: responseText,
						});

						// Kirim respons (rate limited: maks 1 pesan/detik)
						await sendWithRateLimit(sock, jid, { text: responseText });
					} catch (err) {
						console.error("message processing failed for %s:", jid, err);
					}
				}, 5_000),
			);
		}
	});

	setInterval(async () => {
		await pollNotifications(sock, botUserId);
		await pollResolvedComplaints(sock, botUserId);
	}, 30_000);

	console.log("WhatsApp bot started");
};

const processCommand = async (
	tenant: typeof tenants.$inferSelect,
	text: string,
): Promise<string> => {
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
		return submitComplaint(tenant, text);
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
};

main();
