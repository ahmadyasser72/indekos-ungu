import fs from "node:fs/promises";
import path from "node:path";
import { db, eq } from "@indekos/database";
import { complaints, type Tenant } from "@indekos/database/schema";
import { formatDate } from "@indekos/utilities/date";
import { sendPush } from "@indekos/utilities/push";

import { render } from "../template";

type ImageData = { buffer: Buffer; mimetype: string };

const getUploadsDir = () =>
	process.env.UPLOADS_DIR || path.resolve(process.cwd(), "../../site/uploads");

export const saveComplaintImage = async (
	buffer: Buffer,
	mimetype: string,
	complaintId: number,
): Promise<string> => {
	const ext = mimetype.split("/")[1] ?? "jpg";
	const filename = `complaints/${complaintId}.${ext}`;
	const uploadsDir = getUploadsDir();
	const filePath = path.join(uploadsDir, filename);

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await Bun.write(filePath, buffer);

	return filename;
};

export const createComplaint = async (
	tenant: Tenant,
	description: string,
	image?: ImageData,
): Promise<{ id: number; createdAt: Date; imagePath?: string }> => {
	const [newComplaint] = await db
		.insert(complaints)
		.values({
			tenantId: tenant.id,
			description,
			status: "open",
		})
		.returning({ id: complaints.id, createdAt: complaints.createdAt });

	let imagePath: string | undefined = undefined;
	if (image) {
		imagePath = await saveComplaintImage(
			image.buffer,
			image.mimetype,
			newComplaint.id,
		);

		await db
			.update(complaints)
			.set({ imagePath })
			.where(eq(complaints.id, newComplaint.id));
	}

	return { id: newComplaint.id, createdAt: newComplaint.createdAt, imagePath };
};

export const notifyStaffNewComplaint = async (
	tenant: Tenant,
	description: string,
	image?: ImageData,
	imagePath?: string,
) => {
	const users = await db.query.users.findMany({
		where: { role: "staff" },
	});

	if (users.length === 0) return;

	try {
		await sendPush(users, {
			title: `Komplain Baru dari ${tenant.fullName}`,
			body: image ? `${description} [dengan foto]` : description,
			url: "/dashboard/complaints",
			imagePath,
		});
	} catch (err) {
		console.error("push notification failed:", err);
	}
};

export const submitComplaintResponse = async (
	tenant: Tenant,
	text: string,
	image?: ImageData,
): Promise<string> => {
	const description = text.replace(/^komplain\s*/i, "").trim();

	if (!description || description.length < 5) {
		if (image) {
			// Image without text = valid (min description bypassed)
			const trimmed = text.replace(/^komplain\s*/i, "").trim() || "Foto";
			const complaint = await createComplaint(tenant, trimmed, image);
			await notifyStaffNewComplaint(
				tenant,
				trimmed,
				image,
				complaint.imagePath,
			);

			return render("submit-complaint", {
				id: complaint.id,
				description: trimmed,
				createdAt: formatDate(complaint.createdAt),
			});
		}

		return render("submit-complaint-format", {});
	}

	const complaint = await createComplaint(tenant, description, image);
	await notifyStaffNewComplaint(
		tenant,
		description,
		image,
		complaint.imagePath,
	);

	return render("submit-complaint", {
		id: complaint.id,
		description,
		createdAt: formatDate(complaint.createdAt),
	});
};
