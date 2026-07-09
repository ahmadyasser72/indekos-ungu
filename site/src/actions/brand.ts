import { db } from "@indekos/database";
import { auditDetail, auditLogs } from "@indekos/database/schema";
import { BRAND_FILE, config } from "@indekos/utilities/brand";

import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

export const update = defineAction({
	accept: "form",
	input: z.object({
		siteName: z.string().nonempty("Nama situs tidak boleh kosong"),
		siteTagline: z.string().nonempty("Tagline tidak boleh kosong"),
		address: z.string().nonempty("Alamat tidak boleh kosong"),
		phone: z.string().nonempty("Nomor telepon tidak boleh kosong"),
	}),
	handler: async (input, context) => {
		const log = context.locals.logger.child({ module: "actions:brand:update" });
		const user = context.locals.user!;
		if (user.role !== "admin" && user.role !== "owner") {
			throw new ActionError({
				code: "FORBIDDEN",
				message: "Hanya admin dan owner yang dapat mengubah branding.",
			});
		}

		log.info({ userId: user.id }, "attempting to update brand configuration");

		try {
			const original = { ...config };
			await Bun.write(BRAND_FILE, JSON.stringify(input, null, 4));
			await Bun.sleep(300); // fs watcher delay

			await db.insert(auditLogs).values({
				userId: user.id,
				action: "UPDATE",
				tableName: "brand.json",
				details: auditDetail.update(`Mengubah branding situs`, original, input),
			});

			log.info("brand configuration updated successfully");
		} catch (error) {
			log.error(
				{ error, userId: user.id },
				"failed to write brand configuration file",
			);

			throw new ActionError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Gagal menyimpan perubahan branding.",
			});
		}
	},
});
