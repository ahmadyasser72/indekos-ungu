declare global {
	var showClientSideToast: (
		type: "info" | "error",
		title: string,
		description?: string,
	) => void;

	var htmx: typeof import("htmx.org").default;
}

export {};
