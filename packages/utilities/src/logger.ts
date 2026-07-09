import pino from "pino";

export type Logger = pino.Logger;

export const baseLogger = pino({
	transport: import.meta.env.DEV
		? { target: "pino-pretty", options: { colorize: true } }
		: undefined,

	level: process.env.LOG_LEVEL ?? "info",
});

export const createLogger = (componentName: string) => {
	return baseLogger.child({ componentName });
};
