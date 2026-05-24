import * as Sentry from "@sentry/bun";

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 0,
});

process.on("uncaughtException", (err) => {
	Sentry.captureException(err);
});

export { Sentry };
