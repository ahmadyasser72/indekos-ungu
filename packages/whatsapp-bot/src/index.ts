import { db, eq } from "@e-kos/database";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	tenants,
	type Tenant,
} from "@e-kos/database/schema";
import { createLogger } from "@e-kos/utilities/logger";

import { makeWASocket } from "baileys";

import { useSqliteAuthState } from "./auth";
import { checkBills } from "./commands/check-bills";
import { checkComplaint } from "./commands/check-complaint";
import { help } from "./commands/help";
import { listComplaints } from "./commands/list-complaints";
import { paymentHistory } from "./commands/payment-history";
import { submitComplaint } from "./commands/submit-complaint";
import { tenantInfo } from "./commands/tenant-info";
import {
	pollInProgressComplaints,
	pollResolvedComplaints,
} from "./polls/complaints";
import { pollNotifications } from "./polls/notifications";
import { render } from "./template";

interface PendingMessage {
	tenant: Tenant;
	text: string;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingMessages = new Map<string, PendingMessage>();
const unknownCooldowns = new Map<string, number>();

export const main = async () => {
	const botUser = await db.query.users.findFirst({
		where: { username: "bot-wa" },
	});

	if (!botUser) {
		console.error("User 'bot-wa' not found. Run `bun run db:seed` first.");
		process.exit(1);
	}

	const { state, saveCreds } = await useSqliteAuthState();

	if (!state.creds.me) {
		console.error("WhatsApp belum login.");
		process.exit(1);
	}

	const sock = makeWASocket({
		auth: state,
		logger: createLogger("whatsapp-bot"),
	});

	let lastSendTime = 0;
	const sendMessage = sock.sendMessage;
	sock.sendMessage = async (...args) => {
		const now = Date.now();
		const elapsed = now - lastSendTime;

		if (elapsed < 1_000) {
			const wait = 1_000 - elapsed;
			console.warn("rate limit: waiting %d ms before next send", wait);
			await Bun.sleep(wait);
		}

		const out = await sendMessage(...args);
		lastSendTime = Date.now();
		return out;
	};

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

				sock.sendMessage(jid, {
					text: render("unknown-number", {}),
				});

				// Cooldown 30 detik sebelum bisa reply nomor yg sama lagi
				unknownCooldowns.set(jid, Date.now() + 30_000);

				await db.insert(auditLogs).values({
					userId: botUser.id,
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

					sock.sendMessage(
						jid,
						{
							text: render("verification-success", {
								fullName: tenant.fullName,
							}),
						},
						{ quoted: message },
					);
				} else {
					sock.sendMessage(jid, {
						text: render("verification-prompt", { fullName: tenant.fullName }),
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

						sock.sendMessage(jid, { text: responseText }, { quoted: message });
					} catch (err) {
						console.error("message processing failed for %s:", jid, err);
					}
				}, 5_000),
			);
		}
	});

	setInterval(async () => {
		await Promise.all([
			pollNotifications(sock, botUser.id),
			pollResolvedComplaints(sock, botUser.id),
			pollInProgressComplaints(sock, botUser.id),
		]);
	}, 30_000);

	console.log("WhatsApp bot started");
};

const processCommand = async (
	tenant: Tenant,
	text: string,
): Promise<string> => {
	const lower = text.toLowerCase().trim();

	if (lower === "help") {
		return help(tenant);
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

	return render("unknown-command", {});
};

main();
