import fs from "node:fs/promises";
import path from "node:path";
import { db, eq } from "@indekos/database";
import {
	auditDetail,
	auditLogs,
	complaints,
	type Complaint,
} from "@indekos/database/schema";
import { UPLOADS_DIR } from "@indekos/utilities/database";
import { formatDate } from "@indekos/utilities/date";
import type { Logger } from "@indekos/utilities/logger";
import { sendPush } from "@indekos/utilities/push";
import { truncate } from "@indekos/utilities/transforms";

import type {
	ActiveTenant,
	ConversationSession,
	FlowDef,
	MessageInput,
} from "~/conversation/types";
import { render } from "~/template";

export const saveComplaintImage = async (
	{ buffer, mimetype }: NonNullable<MessageInput["image"]>,
	complaintId: number,
	options?: { logger?: Logger },
): Promise<string> => {
	const log = options?.logger?.child({
		submodule: "conversation:complaint:save-image",
	});

	const ALLOWED_IMAGE_EXT = new Set(["jpeg", "jpg", "png", "gif", "webp"]);
	const rawExt = path.basename(mimetype.split("/")[1] ?? "").toLowerCase();
	const ext = ALLOWED_IMAGE_EXT.has(rawExt) ? rawExt : "jpg";

	const filename = `complaints/${complaintId}.${ext}`;
	const filePath = path.join(UPLOADS_DIR, filename);

	log?.debug(
		{
			complaintId: complaintId,
			mimetype: mimetype,
			extension: ext,
			filePath: filePath,
		},
		"saving complaint image",
	);

	try {
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await Bun.write(filePath, buffer);

		log?.info(
			{ complaintId: complaintId, filename: filename },
			"complaint image saved successfully",
		);

		return filename;
	} catch (error) {
		log?.error(
			{ error: error, complaintId: complaintId, filePath: filePath },
			"failed to save complaint image",
		);
		throw error;
	}
};

export const createComplaint = async (
	tenant: ActiveTenant,
	description: string,
	image?: MessageInput["image"],
	options?: { logger?: Logger },
) => {
	const log = options?.logger?.child({
		submodule: "conversation:complaint:create",
	});

	log?.debug(
		{
			tenantId: tenant.id,
			roomNumber: tenant.lease.room.roomNumber,
			hasImage: !!image,
		},
		"creating complaint",
	);

	try {
		const [newComplaint] = await db
			.insert(complaints)
			.values({ tenantId: tenant.id, description, status: "open" })
			.returning({ id: complaints.id, createdAt: complaints.createdAt });

		let imagePath: string | null = null;
		if (image) {
			try {
				imagePath = await saveComplaintImage(image, newComplaint.id, options);

				await db
					.update(complaints)
					.set({ imagePath })
					.where(eq(complaints.id, newComplaint.id));
			} catch (error) {
				log?.error(
					{ error: error, complaintId: newComplaint.id },
					"failed to save complaint image",
				);
			}
		}

		const botUser = await db.query.users.findFirst({
			where: { username: "bot-wa" },
		});
		if (botUser) {
			await db.insert(auditLogs).values({
				userId: botUser.id,
				action: "CREATE",
				tableName: "complaints",
				recordId: newComplaint.id,
				details: auditDetail.create(
					`${tenant.fullName} (${tenant.lease.room.roomNumber}) membuat keluhan: ${truncate(description)}`,
					{ tenantId: tenant.id, description, status: "open", imagePath },
				),
			});
		}

		log?.info(
			{
				complaintId: newComplaint.id,
				tenantId: tenant.id,
				imagePath: imagePath,
			},
			"complaint created successfully",
		);

		return { ...newComplaint, description, imagePath };
	} catch (error) {
		log?.error(
			{ error: error, tenantId: tenant.id },
			"failed to create complaint",
		);
		throw error;
	}
};

export const notifyStaffNewComplaint = async (
	tenant: ActiveTenant,
	complaint: Pick<Complaint, "description" | "imagePath">,
	options?: { logger?: Logger },
): Promise<void> => {
	const log = options?.logger?.child({
		submodule: "conversation:complaint:notify-staff",
	});

	log?.debug(
		{ tenantId: tenant.id, roomNumber: tenant.lease.room.roomNumber },
		"notifying staff of new complaint",
	);

	try {
		const users = await db.query.users.findMany({
			where: { role: "staff" },
		});

		if (users.length === 0) {
			log?.warn("no staff users found to notify");
			return;
		}

		await sendPush(
			users,
			{
				title: `Komplain Baru dari ${tenant.fullName}`,
				body: complaint.description,
				url: "/dashboard/for/complaints",
				imagePath: complaint.imagePath ?? undefined,
			},
			{ logger: log },
		);

		const botWaUser = await db.query.users.findFirst({
			where: { username: "bot-wa" },
		});
		if (botWaUser) {
			await db.insert(auditLogs).values({
				userId: botWaUser.id,
				action: "CREATE",
				tableName: "push_history",
				details: auditDetail.notification(
					`Mengirim notifikasi keluhan ${tenant.fullName} (${tenant.lease.room.roomNumber}) baru ke staff`,
					"push",
					users.map(({ id }) => id),
				),
			});
		}

		log?.info(
			{
				tenantId: tenant.id,
				staff: users.length,
			},
			"staff notified of new complaint",
		);
	} catch (error) {
		log?.error(
			{ error: error, tenantId: tenant.id },
			"failed to send push notification",
		);
	}
};

const completeComplaint = async (
	session: ConversationSession,
	text: string,
	image?: MessageInput["image"],
	logger?: Logger,
) => {
	const log = logger?.child({ submodule: "conversation:complaint:complete" });

	if (!session.tenant.lease) {
		log?.info({ tenantId: session.tenant.id }, "no active lease for complaint");
		return {
			reply: render("no-lease-complaint", {}),
			next: null,
		};
	}

	const description = image ? text || "Foto" : text;

	if (!image && description.length < 5) {
		log?.debug(
			{
				tenantId: session.tenant.id,
				descriptionLength: description.length,
			},
			"complaint description too short",
		);
		return {
			reply:
				"✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan.",
		};
	}

	try {
		const complaint = await createComplaint(
			session.tenant,
			description,
			image,
			{ logger },
		);
		await notifyStaffNewComplaint(session.tenant, complaint, { logger });

		log?.info(
			{
				tenantId: session.tenant.id,
				complaintId: complaint.id,
				hasImage: !!image,
			},
			"complaint created and staff notified",
		);

		return {
			reply: render("submit-complaint", {
				id: complaint.id,
				description,
				createdAt: formatDate(complaint.createdAt),
			}),
			next: null,
		};
	} catch (error) {
		log?.error(
			{ error, tenantId: session.tenant.id },
			"failed to create complaint",
		);
		throw error;
	}
};

export const complaintFlow: FlowDef = {
	name: "complaint",
	initialStep: "prompt",
	steps: {
		prompt: async (input, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:complaint:prompt",
			});

			if (!session.tenant.lease) {
				log?.info(
					{ tenantId: session.tenant.id },
					"no active lease for complaint flow",
				);
				return {
					reply: render("no-lease-complaint", {}),
					next: null,
				};
			}

			const text = input.text.replace(/^komplain\s*/i, "").trim();
			const lower = text.toLowerCase();

			if (input.image || text) {
				if (lower === "batal") {
					log?.debug(
						{ tenantId: session.tenant.id },
						"complaint flow cancelled by user",
					);
					return { reply: "❌ Komplain dibatalkan.", next: null };
				}

				return completeComplaint(session, text, input.image, options?.logger);
			}

			return { reply: render("complaint-prompt", {}), next: "collect" };
		},

		collect: async (input: MessageInput, session, options) => {
			const log = options?.logger?.child({
				submodule: "conversation:complaint:collect",
			});

			const text = input.text.trim();
			const lower = text.toLowerCase();

			if (lower === "batal") {
				log?.debug(
					{ tenantId: session.tenant.id },
					"complaint flow cancelled by user",
				);
				return { reply: "❌ Komplain dibatalkan.", next: null };
			}

			return completeComplaint(session, text, input.image, options?.logger);
		},
	},
};
