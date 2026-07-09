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

const baseLogger = createLogger("whatsapp-bot");

const unknownCooldowns = new Map<string, number>();

const conversationManager = new ConversationManager();
conversationManager.registerFlow(complaintFlow);

export const main = async () => {
	const log = baseLogger.child({ module: "bot:main" });

	try {
		const botUser = await db.query.users.findFirst({
			where: { username: "bot-wa" },
		});

		if (!botUser) {
			log.error(
				"system initialization failure: database user record 'bot-wa' not found, run seed script first",
			);
			process.exit(1);
		}

		const { state, saveCreds } = await useSqliteAuthState();

		if (!state.creds.me) {
			log.error(
				"system authentication failure: active whatsapp session not found, authentication required",
			);
			process.exit(1);
		}

		// Pass a dedicated child logger into Baileys' internal connection configuration object
		const socket = makeWASocket({
			auth: state,
			logger: baseLogger.child({ module: "vendor:baileys" }),
		});

		let lastSendTime = 0;
		const rawSendMessage = socket.sendMessage;

		socket.sendMessage = async (...argumentsList) => {
			const currentTime = Date.now();
			const elapsedTime = currentTime - lastSendTime;

			if (elapsedTime < 1_000) {
				const waitTime = 1_000 - elapsedTime;
				log.warn(
					{ waitTimeMilliseconds: waitTime },
					"rate limit encountered: throttling outgoing worker stream thread",
				);
				await Bun.sleep(waitTime);
			}

			const output = await rawSendMessage(...argumentsList);
			lastSendTime = Date.now();
			return output;
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

			await socket.sendMessage(jid, { text: message }, { quoted });
		};

		socket.ev.on("creds.update", saveCreds);

		socket.ev.on("connection.update", ({ connection, lastDisconnect }) => {
			const connectionLogger = baseLogger.child({ module: "bot:connection" });

			if (connection === "open") {
				connectionLogger.info(
					"whatsapp interface socket connection established successfully",
				);
				return;
			}

			connectionLogger.warn(
				{ connectionState: connection },
				"whatsapp socket client interface state changed",
			);

			if (lastDisconnect?.error) {
				connectionLogger.error(
					{ error: lastDisconnect.error },
					"whatsapp socket client link dropped with fatal transport error",
				);
			}

			// Reconnect unless explicitly logged out
			if (
				connection === "close" &&
				(lastDisconnect?.error as any)?.output?.statusCode !==
					DisconnectReason.loggedOut
			) {
				connectionLogger.info(
					"attempting to re-establish dropped connection socket channels",
				);
				main();
			}
		});

		socket.ev.on("messages.upsert", async ({ messages }) => {
			const handleMessage = async (message: WAMessage) => {
				if (message.key.fromMe) return;

				const jid = message.key.remoteJidAlt ?? message.key.remoteJid;
				if (!jid || !jid.endsWith("@s.whatsapp.net")) return;

				// Spawn a scoped child tracking the explicit incoming message identifier details
				const messageLogger = baseLogger.child({
					module: "bot:message-handler",
					messageId: message.key.id,
					remoteJid: jid,
				});

				const imageMessage = message.message?.imageMessage;
				const text = (
					message.message?.conversation ||
					imageMessage?.caption ||
					""
				).trim();

				if (!text && !imageMessage) return;

				const lowerText = text.toLowerCase().trim();
				const phoneNumber = jid.replace("@s.whatsapp.net", "");

				const tenant = await db.query.tenants.findFirst({
					where: { phoneNumber: phoneNumber },
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

					messageLogger.warn(
						{ unmappedPhoneNumber: phoneNumber },
						"message rejected: sender phone number is not registered in core database",
					);

					await socket.sendMessage(jid, { text: render("unknown-number", {}) });
					unknownCooldowns.set(jid, Date.now() + 30_000);

					await db.insert(auditLogs).values({
						userId: botUser.id,
						action: "REJECT",
						tableName: "chatbot_messages",
						details: auditDetail.reject(
							`Menolak pesan dari nomor tidak terdaftar: ${phoneNumber}`,
							"unregistered_number",
						),
					});

					return;
				}

				// Add tenant context properties directly onto our structured message tracing logger
				const tenantLogger = messageLogger.child({
					tenantId: tenant.id,
				});

				await db.insert(chatbotMessages).values({
					tenantId: tenant.id,
					direction: "incoming",
					message: imageMessage ? ["📷 [gambar]", text].join("\n") : text,
				});

				// Tenant verification sequence checkpoint
				if (!tenant.isVerified) {
					tenantLogger.info(
						"unverified tenant contact text routing through confirmation checkpoint",
					);

					if (lowerText === "ya") {
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

				// Build message input parameter structures
				const messageInput: MessageInput = { text };
				if (imageMessage) {
					try {
						tenantLogger.info(
							"binary attachment detected: downloading raw media buffers from cloud servers",
						);
						const buffer = await downloadMediaMessage(
							message,
							"buffer",
							{},
							{
								reuploadRequest: (message) =>
									socket.updateMediaMessage(message),
								logger: socket.logger,
							},
						);
						messageInput.image = {
							buffer,
							mimetype: imageMessage.mimetype ?? "image/jpeg",
						};
					} catch (error) {
						tenantLogger.error(
							{ error },
							"media pipeline failure: unable to download or parse incoming attachment binary streams",
						);
					}
				}

				if (conversationManager.hasActiveSession(jid)) {
					tenantLogger.info(
						"active multi-turn conversational session context detected, bypassing static routing",
					);
					const reply = await conversationManager.handleMessage(
						jid,
						messageInput,
					);
					if (reply) await replyAndLog(jid, tenant.id, reply, message);
					return;
				}

				if (lowerText === "komplain") {
					tenantLogger.info(
						"conversational wizard command matched: initializing active complaint flow session context",
					);
					conversationManager.startSession(jid, tenant, "complaint");

					const reply = await conversationManager.handleMessage(
						jid,
						messageInput,
					);
					if (reply) await replyAndLog(jid, tenant.id, reply, message);
					return;
				}

				tenantLogger.info(
					{ commandText: lowerText },
					"processing standard command text instruction keyword match",
				);
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
					baseLogger.error(
						{
							error,
							messageId: message.key.id,
							remoteJid: message.key.remoteJidAlt ?? message.key.remoteJid,
						},
						"critical message processing exception: worker pipeline failed to process item",
					);
				}
			}
		});

		// Setup automated transaction polling worker intervals
		setInterval(async () => {
			const pollLogger = baseLogger.child({ module: "bot:polling-interval" });
			try {
				await Promise.allSettled([
					pollNotifications(socket, botUser.id),
					pollResolvedComplaints(socket, botUser.id),
					pollInProgressComplaints(socket, botUser.id),
				]);
			} catch (error) {
				pollLogger.error(
					{ error },
					"background tracking error: exception thrown during standard polling tick",
				);
			}
		}, 5_000);

		log.info(
			"whatsapp daemon event consumer engine successfully listening on interface gates",
		);
	} catch (error) {
		log.error(
			{ error },
			"fatal startup exception: chatbot orchestration thread crashed completely",
		);
		process.exit(1);
	}
};

const processCommand = async (
	tenant: ConversationSession["tenant"],
	text: string,
	image?: { buffer: Buffer; mimetype: string },
): Promise<string> => {
	const lowerText = text.toLowerCase().trim();

	if (lowerText === "help") return help(tenant);
	if (lowerText === "komplain" || lowerText.startsWith("komplain ")) {
		return submitComplaint(tenant, text, image);
	}
	if (lowerText === "tagihan") return checkBills(tenant);
	if (lowerText === "riwayat") return paymentHistory(tenant);
	if (lowerText === "info") return tenantInfo(tenant);

	const complaintMatch = lowerText.match(/^komplainku(?: (\d+))?$/);
	if (complaintMatch) {
		const identifier = complaintMatch[1];
		if (identifier) return checkComplaint(tenant, Number(identifier));
		return listComplaints(tenant);
	}

	return render("unknown-command", {});
};

main();
