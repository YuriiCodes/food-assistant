import * as Sentry from "@sentry/bun";
import { ENV } from "./env.ts";

Sentry.init({
	dsn: ENV.SENTRY_DSN,
	environment: ENV.NODE_ENV,
	tracesSampleRate: 0,
});

process.on("uncaughtException", (err) => {
	Sentry.captureException(err);
});

export { Sentry };
