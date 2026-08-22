import process from "node:process";
import { z } from "zod";

const ALLOWED_ENVS = ["production", "local", "test"] as const;

const envSchema = z.object({
	DATABASE_URL: z.url(),

	NODE_ENV: z.enum(ALLOWED_ENVS),

	SENTRY_DSN: z.string(),

	OPEN_ROUTER_MODEL: z.string().min(1),
	OPEN_ROUTER_API_KEY: z.string().min(1),

	TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/, {
		message: "must be a Telegram bot token (format: <id>:<hash>)",
	}),
	TELEGRAM_BOT_USERNAME: z.string().min(1),
	TELEGRAM_ALLOWED_CHANNEL: z.string().min(1),
	REDIS_URL: z.url(),
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);
