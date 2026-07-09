import { db } from "@indekos/database";
import { botAuth } from "@indekos/database/schema";

import pino from "pino";

const log = pino({ level: "info" }).child({ submodule: "auth:logout" });

const logout = async () => {
	log.info("initiating whatsapp session logout");

	try {
		const rows = await db.delete(botAuth).returning();

		if (rows.length === 0) {
			log.warn("no active whatsapp session found");
			console.log("Tidak ada sesi WhatsApp yang aktif.");
		} else {
			log.info(
				{ deletedAuthCount: rows.length },
				"whatsapp session credentials deleted",
			);
			console.log(`Sesi WhatsApp telah dihapus (${rows.length} data auth).`);
		}

		process.exit(0);
	} catch (error) {
		log.error({ error }, "failed to delete whatsapp session");
		throw error;
	}
};

logout();
