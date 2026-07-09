import { db, eq } from "@indekos/database";
import { auditDetail, auditLogs, complaints } from "@indekos/database/schema";

import type { WASocket } from "baileys";
import type { Logger } from "pino";

import { render } from "~/template";

export const pollInProgressComplaints = async (
	sock: WASocket,
	botUserId: number,
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "polls:complaints:in-progress",
	});

	log?.debug("polling for in-progress complaints");

	try {
		const inProgress = await db.query.complaints.findMany({
			where: { status: "in_progress", processedAt: { isNull: true } },
			with: { tenant: true },
		});

		log?.info(
			{ complaintCount: inProgress.length },
			"found unnotified in-progress complaints",
		);

		for (const complaint of inProgress) {
			try {
				const message = render("complaint-in-progress", {
					fullName: complaint.tenant.fullName,
					id: complaint.id,
					description: complaint.description,
				});

				await sock.sendMessage(
					`${complaint.tenant.phoneNumber}@s.whatsapp.net`,
					{
						text: message,
					},
				);

				await db
					.update(complaints)
					.set({ processedAt: new Date() })
					.where(eq(complaints.id, complaint.id));

				await db.insert(auditLogs).values({
					userId: botUserId,
					action: "CREATE",
					tableName: "notifications",
					details: auditDetail.notification(
						`Bot memberitahu tenant #${complaint.tenant.id} bahwa komplain #${complaint.id} sedang diproses`,
						"whatsapp",
						complaint.tenant.id,
					),
				});

				log?.info(
					{
						complaintId: complaint.id,
						tenantId: complaint.tenant.id,
						phoneNumber: complaint.tenant.phoneNumber,
					},
					"in-progress complaint notification sent",
				);
			} catch (error) {
				log?.error(
					{
						error,
						complaintId: complaint.id,
						tenantId: complaint.tenant.id,
					},
					"failed to send in-progress notification",
				);
			}
		}
	} catch (error) {
		log?.error({ error }, "failed to poll in-progress complaints");
		throw error;
	}
};

export const pollResolvedComplaints = async (
	sock: WASocket,
	botUserId: number,
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "polls:complaints:resolved",
	});

	log?.debug("polling for resolved complaints");

	try {
		const resolved = await db.query.complaints.findMany({
			where: { status: "resolved", resolvedAt: { isNull: true } },
			with: { tenant: true, resolver: true },
		});

		log?.info(
			{ complaintCount: resolved.length },
			"found unnotified resolved complaints",
		);

		for (const complaint of resolved) {
			try {
				const message = render("complaint-resolved", {
					fullName: complaint.tenant.fullName,
					id: complaint.id,
					description: complaint.description,
					resolveNotes: complaint.resolveNotes ?? null,
					resolverDisplayName: complaint.resolver?.displayName ?? "Staf",
				});

				await sock.sendMessage(
					`${complaint.tenant.phoneNumber}@s.whatsapp.net`,
					{
						text: message,
					},
				);

				await db
					.update(complaints)
					.set({ resolvedAt: new Date() })
					.where(eq(complaints.id, complaint.id));

				await db.insert(auditLogs).values({
					userId: botUserId,
					action: "CREATE",
					tableName: "notifications",
					details: auditDetail.notification(
						`Bot memberitahu tenant #${complaint.tenant.id} bahwa komplain #${complaint.id} selesai diproses`,
						"whatsapp",
						complaint.tenant.id,
					),
				});

				log?.info(
					{
						complaintId: complaint.id,
						tenantId: complaint.tenant.id,
						phoneNumber: complaint.tenant.phoneNumber,
					},
					"resolved complaint notification sent",
				);
			} catch (error) {
				log?.error(
					{
						error,
						complaintId: complaint.id,
						tenantId: complaint.tenant.id,
					},
					"failed to send resolved notification",
				);
			}
		}
	} catch (error) {
		log?.error({ error }, "failed to poll resolved complaints");
		throw error;
	}
};
