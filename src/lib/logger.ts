import pino from "pino";
import { ENV } from "../config/env.ts";

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	transport:
		ENV.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});

export const createLogger = (context: string) => logger.child({ context });
