// @ts-check
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, logHandlers } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	security: {
		checkOrigin: false,
		allowedDomains: [
			{ hostname: "cat.opah-barley.ts.net" },
			{ hostname: "indekos-ungu.my.id" },
		],
	},
	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: ["cat.opah-barley.ts.net", "indekos-ungu.my.id"],
			hmr: false,
		},
	},

	devToolbar: { enabled: false },
});
