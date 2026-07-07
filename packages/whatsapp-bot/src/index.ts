import { db, eq } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	chatbotMessages,
	tenants,
} from "@indekos/database/schema";
import { createLogger } from "@indekos/utilities/logger";

import {
	DisconnectReason,
	downloadMediaMessage,
	makeWASocket,
	type WAMessage,
} from "baileys";

import { useSqliteAuthState } from "./auth";
import { checkBills } from "./commands/check-bills";
import { checkComplaint } from "./commands/check-complaint";
import { help } from "./commands/help";
import { listComplaints } from "./commands/list-complaints";
import { paymentHistory } from "./commands/payment-history";
import { submitComplaint } from "./commands/submit-complaint";
import { tenantInfo } from "./commands/tenant-info";
import { complaintFlow } from "./conversation/flows/complaint";
import { ConversationManager } from "./conversation/manager";
import type { ConversationSession, MessageInput } from "./conversation/types";
import {
	pollInProgressComplaints,
	pollResolvedComplaints,
} from "./polls/complaints";
import { pollNotifications } from "./polls/notifications";
import { render } from "./template";

const unknownCooldowns = new Map<string, number>();

const conversationManager = new ConversationManager();
conversationManager.registerFlow(complaintFlow);

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

	const replyAndLog = async (
		jid: string,
		tenantId: number,
		message: string,
		quoted?: WAMessage,
	) => {
		await db.insert(chatbotMessages).values({
			tenantId,
			message,
			direction: "outgoing",
		});

		await sock.sendMessage(jid, { text: message }, { quoted });
	};

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
		if (connection === "open") {
			console.log("WhatsApp connected");
			return;
		}

		console.warn("connection status: %s", connection);
		if (lastDisconnect?.error) {
			console.error("disconnect error:", lastDisconnect.error);
		}

		// Reconnect unless logged out
		if (
			connection === "close" &&
			(lastDisconnect?.error as any)?.output?.statusCode !==
				DisconnectReason.loggedOut
		) {
			console.log("reconnecting...");
			main(); // re-runs full setup (new socket, re-attaches listeners)
		}
	});

	sock.ev.on("messages.upsert", async ({ messages }) => {
		const handleMessage = async (message: WAMessage) => {
			if (message.key.fromMe) return;

			const jid = message.key.remoteJidAlt ?? message.key.remoteJid;
			if (!jid || !jid?.endsWith("@s.whatsapp.net")) return;

			const imageMessage = message.message?.imageMessage;
			const text = (
				message.message?.conversation ||
				imageMessage?.caption ||
				""
			).trim();

			if (!text && !imageMessage) return;

			const lower = text.toLowerCase().trim();
			const phone = jid.replace("@s.whatsapp.net", "");
			const tenant = await db.query.tenants.findFirst({
				where: { phoneNumber: phone },
				with: {
					lease: {
						columns: {},
						with: { room: true },
					},
				},
			});

			if (!tenant) {
				const cooldownUntil = unknownCooldowns.get(jid);
				if (cooldownUntil && Date.now() < cooldownUntil) return;

				await sock.sendMessage(jid, { text: render("unknown-number", {}) });

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

				return;
			}

			await db.insert(chatbotMessages).values({
				tenantId: tenant.id,
				direction: "incoming",
				message: imageMessage ? ["📷 [gambar]", text].join("\n") : text,
			});

			// Tenant belum verifikasi — cek konfirmasi "YA"
			if (!tenant.isVerified) {
				if (lower === "ya") {
					await db
						.update(tenants)
						.set({ isVerified: true })
						.where(eq(tenants.id, tenant.id));

					await replyAndLog(
						jid,
						tenant.id,
						render("verification-success", { fullName: tenant.fullName }),
						message,
					);
				} else {
					await replyAndLog(
						jid,
						tenant.id,
						render("verification-prompt", { fullName: tenant.fullName }),
						message,
					);
				}

				return;
			}

			// Build message input — download image if present
			const messageInput: MessageInput = { text };
			if (imageMessage) {
				try {
					const buffer = await downloadMediaMessage(
						message,
						"buffer",
						{},
						{
							reuploadRequest: (message) => sock.updateMediaMessage(message),
							logger: sock.logger,
						},
					);
					messageInput.image = {
						buffer,
						mimetype: imageMessage.mimetype ?? "image/jpeg",
					};
				} catch (err) {
					console.error("failed to download image for %s:", jid, err);
				}
			}

			if (conversationManager.hasActiveSession(jid)) {
				const reply = await conversationManager.handleMessage(
					jid,
					messageInput,
				);
				if (reply) await replyAndLog(jid, tenant.id, reply, message);

				return;
			}

			if (lower === "komplain") {
				conversationManager.startSession(jid, tenant, "complaint");

				const reply = await conversationManager.handleMessage(
					jid,
					messageInput,
				);
				if (reply) await replyAndLog(jid, tenant.id, reply, message);

				return;
			}

			const responseText = await processCommand(
				tenant,
				text,
				messageInput.image,
			);

			await replyAndLog(jid, tenant.id, responseText, message);
		};

		for (const message of messages) {
			try {
				await handleMessage(message);
			} catch (error) {
				console.error(
					"failed to process message %s from %s:",
					message.key.id,
					message.key.remoteJidAlt ?? message.key.remoteJid,
					error,
				);
			}
		}
	});

	setInterval(async () => {
		await Promise.allSettled([
			pollNotifications(sock, botUser.id),
			pollResolvedComplaints(sock, botUser.id),
			pollInProgressComplaints(sock, botUser.id),
		]);
	}, 5_000);

	console.log("WhatsApp bot started");
};

const processCommand = async (
	tenant: ConversationSession["tenant"],
	text: string,
	image?: { buffer: Buffer; mimetype: string },
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
		return submitComplaint(tenant, text, image);
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
