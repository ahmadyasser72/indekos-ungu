import { db } from "@indekos/database";
import { botAuth } from "@indekos/database/schema";
import { createLogger } from "@indekos/utilities/logger";

const log = createLogger("whatsapp-bot").child({ submodule: "auth:logout" });

const logout = async () => {
	log.info("initiating whatsapp session logout");

	try {
		const rows = await db.delete(botAuth).returning();

		if (rows.length === 0) {
			log.warn("no active whatsapp session found");
		} else {
			log.info(
				{ deletedAuth: rows.length },
				"whatsapp session credentials deleted",
			);
		}

		process.exit(0);
	} catch (error) {
		log.error({ error }, "failed to delete whatsapp session");
		throw error;
	}
};

logout();
