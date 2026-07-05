import type { ActionClient } from "astro:actions";

export type FormResult =
	| { success: false; message: string }
	| { success: true; title: string; description: string }
	| undefined;

export type ActionResult = ReturnType<typeof createActionResult<any>>;

export const createActionResult = <TOutput>(
	action: ActionClient<TOutput, any, any>,
	title: string,
	getDescription: (data: TOutput) => string,
) => {
	return { action, title, getDescription };
};

export const checkActionResult = <T>(
	{ error, data }: { error?: { message?: string }; data?: T },
	{
		title,
		getDescription,
	}: {
		title: string;
		getDescription: (data: T) => string;
	},
): FormResult => {
	if (error?.message) return { success: false, message: error.message };
	if (data) return { success: true, title, description: getDescription(data) };
};
