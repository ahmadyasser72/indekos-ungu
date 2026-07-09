import { DisconnectReason, makeWASocket } from "baileys";
import open from "open";
import pino from "pino";
import { renderSVG } from "uqr";

import { useSqliteAuthState } from "./auth";

const log = pino({ level: "info" }).child({ submodule: "auth:login" });

const login = async () => {
	log.info("initiating whatsapp authentication");

	try {
		const { state, saveCreds } = await useSqliteAuthState();

		if (state.creds.me) {
			log.info("existing credentials found, already authenticated");
			return;
		}

		const sock = makeWASocket({ auth: state });

		sock.ev.on("creds.update", saveCreds);

		const SVGFile = Bun.file("qr.svg");
		sock.ev.on(
			"connection.update",
			async ({ connection, lastDisconnect, qr }) => {
				if (qr) {
					log.info("qr code generated, opening browser");
					const qrSVG = renderSVG(qr);
					await SVGFile.write(qrSVG);
					await open(SVGFile.name!, { wait: true });
				}

				if (connection === "open") {
					log.info("whatsapp connection established successfully");
					console.log("\nWhatsApp berhasil terhubung!");
					await SVGFile.delete();
					process.exit(0);
				}

				if (
					connection === "close" &&
					(lastDisconnect?.error as any)?.output?.statusCode !==
						DisconnectReason.loggedOut
				) {
					log.warn(
						{
							statusCode: (lastDisconnect?.error as any)?.output?.statusCode,
						},
						"connection closed, retrying",
					);
					login();
				}
			},
		);
	} catch (error) {
		log.error({ error }, "authentication failed");
		throw error;
	}
};

login();
