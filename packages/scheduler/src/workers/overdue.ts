import { db, inArray } from "@e-kos/database";
import {
	auditDetail,
	auditLogs,
	invoices,
	type User,
} from "@e-kos/database/schema";

import { logger } from "../index";

export const runOverdueCheck = async (systemUser: User, now?: Date) => {
	const ref = now ?? new Date();

	const overdue = await db.query.invoices.findMany({
		where: { status: "unpaid", dueDate: { lte: ref } },
	});

	if (overdue.length > 0) {
		const ids = overdue.map(({ id }) => id);

		await db
			.update(invoices)
			.set({ status: "overdue" })
			.where(inArray(invoices.id, ids));

		await db.insert(auditLogs).values({
			userId: systemUser.id,
			action: "UPDATE",
			tableName: "invoices",
			details: auditDetail.cron(
				`Cron marked ${overdue.length} invoice(s) as overdue`,
				"invoices",
				ids,
			),
		});
	}

	logger.info({ count: overdue.length }, "Overdue invoices updated");
};
