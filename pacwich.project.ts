import { defineProjectConfig } from "pacwich/config";

export default defineProjectConfig({
	defaults: {
		parallelMax: 4,
		cliScriptOutputStyle: "prefixed",
	},
});
