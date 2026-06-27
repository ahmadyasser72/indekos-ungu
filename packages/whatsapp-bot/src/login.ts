import { DisconnectReason, makeWASocket } from "baileys";
import open from "open";
import { renderSVG } from "uqr";

import { useSqliteAuthState } from "./auth";

const login = async () => {
	const { state, saveCreds } = await useSqliteAuthState();

	if (state.creds.me) return;

	const sock = makeWASocket({ auth: state });

	sock.ev.on("creds.update", saveCreds);

	const SVGFile = Bun.file("qr.svg");
	sock.ev.on(
		"connection.update",
		async ({ connection, lastDisconnect, qr }) => {
			if (qr) {
				const qrSVG = renderSVG(qr);
				await SVGFile.write(qrSVG);
				await open(SVGFile.name!, { wait: true });
			}

			if (connection === "open") {
				console.log("\nWhatsApp berhasil terhubung!");
				await SVGFile.delete();
				process.exit(0);
			}

			if (
				connection === "close" &&
				(lastDisconnect?.error as any)?.output?.statusCode !==
					DisconnectReason.loggedOut
			) {
				login();
			}
		},
	);
};

login();
