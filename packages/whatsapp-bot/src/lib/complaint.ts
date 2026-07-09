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
import { sendPush } from "@indekos/utilities/push";

import type { Logger } from "pino";

import type { ActiveTenant, MessageInput } from "~/conversation/types";
import { render } from "~/template";

export const saveComplaintImage = async (
	{ buffer, mimetype }: NonNullable<MessageInput["image"]>,
	complaintId: number,
	options?: { logger?: Logger },
): Promise<string> => {
	const log = options?.logger?.child({ submodule: "lib:complaint:save-image" });

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
	const log = options?.logger?.child({ submodule: "lib:complaint:create" });

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
			const preview =
				description.slice(0, 50) + (description.length > 50 ? "..." : "");
			await db.insert(auditLogs).values({
				userId: botUser.id,
				action: "CREATE",
				tableName: "complaints",
				recordId: newComplaint.id,
				details: auditDetail.create(
					`${tenant.fullName} (${tenant.lease.room.roomNumber}) membuat keluhan: ${preview}`,
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
		submodule: "lib:complaint:notify-staff",
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
				url: "/dashboard/manage/complaints",
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
				staffCount: users.length,
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

export const submitComplaintResponse = async (
	tenant: ActiveTenant,
	text: string,
	image?: MessageInput["image"],
	options?: { logger?: Logger },
): Promise<string> => {
	const log = options?.logger?.child({
		submodule: "lib:complaint:submit-response",
	});

	const description = text.replace(/^komplain\s*/i, "").trim();

	log?.debug(
		{
			tenantId: tenant.id,
			descriptionLength: description.length,
			hasImage: !!image,
		},
		"processing complaint submission response",
	);

	try {
		if (!description || description.length < 5) {
			if (image) {
				// Image without text = valid (min description bypassed)
				const trimmed = description || "Foto";
				log?.info({ tenantId: tenant.id }, "submitting image-only complaint");

				const complaint = await createComplaint(
					tenant,
					trimmed,
					image,
					options,
				);
				await notifyStaffNewComplaint(tenant, complaint, options);

				return render("submit-complaint", {
					id: complaint.id,
					description: trimmed,
					createdAt: formatDate(complaint.createdAt),
				});
			}

			log?.info(
				{ tenantId: tenant.id },
				"complaint description too short, returning format prompt",
			);
			return render("submit-complaint-format", {});
		}

		const complaint = await createComplaint(
			tenant,
			description,
			image,
			options,
		);
		await notifyStaffNewComplaint(tenant, complaint, options);

		log?.info(
			{ tenantId: tenant.id, complaintId: complaint.id },
			"complaint submission response completed",
		);

		return render("submit-complaint", {
			id: complaint.id,
			description,
			createdAt: formatDate(complaint.createdAt),
		});
	} catch (error) {
		log?.error(
			{ error: error, tenantId: tenant.id },
			"failed to process complaint submission response",
		);
		throw error;
	}
};
