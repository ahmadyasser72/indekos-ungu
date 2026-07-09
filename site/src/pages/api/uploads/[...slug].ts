import path from "node:path";
import { UPLOADS_DIR } from "@indekos/utilities/database";

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
	const log = locals.logger.child({ module: "api:uploads:serve" });

	if (!locals.user) {
		log.warn("uploads: unauthenticated access attempt to file system rejected");
		return new Response("Forbidden", { status: 403 });
	}

	const { slug } = params;
	if (!slug) {
		log.warn("uploads: request missing file slug parameter at route entry");
		return new Response("Not Found", { status: 404 });
	}

	// Ensure the resolved path stays within the uploads directory.
	const requestedPath = path.resolve(UPLOADS_DIR, slug);
	if (
		requestedPath !== UPLOADS_DIR &&
		!requestedPath.startsWith(UPLOADS_DIR + path.sep)
	) {
		log.error(
			{ requestedPath, uploadDirectory: UPLOADS_DIR },
			"uploads: path traversal attack or invalid directory breakout blocked",
		);
		return new Response("Forbidden", { status: 403 });
	}

	try {
		const file = Bun.file(requestedPath);
		if (await file.exists()) {
			log.info({ slug }, "uploads: file served successfully from directory");
			return new Response(file);
		} else {
			log.warn({ slug }, "uploads: requested file slug does not exist on disk");
			return new Response("Not Found", { status: 404 });
		}
	} catch (error) {
		log.error(
			{ slug, error },
			"uploads: unexpected exception encountered while reading file stream",
		);
		return new Response("Internal Server Error", { status: 500 });
	}
};
