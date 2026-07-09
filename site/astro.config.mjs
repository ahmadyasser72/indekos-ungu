// @ts-check
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, logHandlers } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	security: { allowedDomains: [{ hostname: "cat.opah-barley.ts.net" }] },
	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: ["cat.opah-barley.ts.net"],
			hmr: false,
		},
	},

	env: {
		schema: {
			DATABASE_PATH: envField.string({
				access: "secret",
				context: "server",
			}),
			CHROMIUM_PATH: envField.string({
				access: "secret",
				context: "server",
			}),
			UPLOADS_DIR: envField.string({
				access: "secret",
				context: "server",
				default: "uploads",
			}),
			DUITKU_MERCHANT_CODE: envField.string({
				access: "secret",
				context: "server",
			}),
			DUITKU_API_KEY: envField.string({ access: "secret", context: "server" }),
			DUITKU_BASE_URL: envField.string({ access: "secret", context: "server" }),

			VAPID_PUBLIC_KEY: envField.string({
				access: "public",
				context: "client",
			}),
			VAPID_PRIVATE_KEY: envField.string({
				access: "secret",
				context: "server",
			}),
			VAPID_SUBJECT: envField.string({ access: "secret", context: "server" }),
		},
	},

	devToolbar: { enabled: false },
});
