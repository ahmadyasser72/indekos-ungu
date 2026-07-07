import fs from "node:fs/promises";
import path from "node:path";
import { db, eq } from "@indekos/database";
import { complaints, type Complaint } from "@indekos/database/schema";
import { UPLOADS_DIR } from "@indekos/utilities/database";
import { formatDate } from "@indekos/utilities/date";
import { sendPush } from "@indekos/utilities/push";

import type { ActiveTenant, MessageInput } from "../conversation/types";
import { render } from "../template";

export const saveComplaintImage = async (
	buffer: Buffer,
	mimetype: string,
	complaintId: number,
) => {
	const ALLOWED_IMAGE_EXT = new Set(["jpeg", "jpg", "png", "gif", "webp"]);
	const rawExt = path.basename(mimetype.split("/")[1] ?? "").toLowerCase();
	const ext = ALLOWED_IMAGE_EXT.has(rawExt) ? rawExt : "jpg";

	const filename = `complaints/${complaintId}.${ext}`;
	const filePath = path.join(UPLOADS_DIR, filename);

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await Bun.write(filePath, buffer);

	return filename;
};

export const createComplaint = async (
	tenant: ActiveTenant,
	description: string,
	image?: MessageInput["image"],
) => {
	const [newComplaint] = await db
		.insert(complaints)
		.values({ tenantId: tenant.id, description, status: "open" })
		.returning({ id: complaints.id, createdAt: complaints.createdAt });

	let imagePath: string | null = null;
	if (image) {
		try {
			imagePath = await saveComplaintImage(
				image.buffer,
				image.mimetype,
				newComplaint.id,
			);

			await db
				.update(complaints)
				.set({ imagePath })
				.where(eq(complaints.id, newComplaint.id));
		} catch (err) {
			console.error("failed to save complaint image:", err);
		}
	}

	return { ...newComplaint, description, imagePath };
};

export const notifyStaffNewComplaint = async (
	tenant: ActiveTenant,
	complaint: Pick<Complaint, "description" | "imagePath">,
) => {
	try {
		const users = await db.query.users.findMany({
			where: { role: "staff" },
		});

		if (users.length === 0) return;

		await sendPush(users, {
			title: `Komplain Baru dari ${tenant.fullName}`,
			body: complaint.description,
			url: "/dashboard/manage/complaints",
			imagePath: complaint.imagePath ?? undefined,
		});
	} catch (err) {
		console.error("push notification failed:", err);
	}
};

export const submitComplaintResponse = async (
	tenant: ActiveTenant,
	text: string,
	image?: { buffer: Buffer; mimetype: string },
) => {
	const description = text.replace(/^komplain\s*/i, "").trim();

	if (!description || description.length < 5) {
		if (image) {
			// Image without text = valid (min description bypassed)
			const trimmed = description || "Foto";
			const complaint = await createComplaint(tenant, trimmed, image);
			await notifyStaffNewComplaint(tenant, complaint);

			return render("submit-complaint", {
				id: complaint.id,
				description: trimmed,
				createdAt: formatDate(complaint.createdAt),
			});
		}

		return render("submit-complaint-format", {});
	}

	const complaint = await createComplaint(tenant, description, image);
	await notifyStaffNewComplaint(tenant, complaint);

	return render("submit-complaint", {
		id: complaint.id,
		description,
		createdAt: formatDate(complaint.createdAt),
	});
};
