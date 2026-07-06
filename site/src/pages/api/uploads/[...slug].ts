import path from "node:path";

import type { APIRoute } from "astro";
import { UPLOADS_DIR } from "astro:env/server";

export const GET: APIRoute = async ({ params }) => {
	const slug = params.slug;
	if (!slug) {
		return new Response("Not Found", { status: 404 });
	}

	// Prevent directory traversal
	const safePath = path.normalize(slug).replace(/^(\.\.(\/|\\|$))+/, "");
	if (safePath.includes("..")) {
		return new Response("Forbidden", { status: 403 });
	}

	const file = Bun.file(path.join(UPLOADS_DIR, safePath));
	if (await file.exists()) return new Response(file);
	else return new Response("Not Found", { status: 404 });
};
