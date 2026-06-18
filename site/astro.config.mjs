// @ts-check
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({ mode: "middleware" }),

	env: {
		schema: {
			DATABASE_PATH: envField.string({
				access: "secret",
				context: "server",
			}),
			DUITKU_MERCHANT_CODE: envField.string({
				access: "secret",
				context: "server",
			}),
			DUITKU_API_KEY: envField.string({ access: "secret", context: "server" }),
			DUITKU_BASE_URL: envField.string({ access: "secret", context: "server" }),
		},
	},

	vite: {
		plugins: [tailwindcss()],
		server: { allowedHosts: ["indekos-ungu.loophole.site"] },
	},
	devToolbar: { enabled: false },
});
