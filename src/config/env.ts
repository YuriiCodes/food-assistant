import process from "node:process";
import { z } from "zod";

const ALLOWED_ENVS = ["production", "local"] as const;

const envSchema = z.object({
	DATABASE_URL: z.string().nonoptional(),

	NODE_ENV: z.enum(ALLOWED_ENVS),

	SENTRY_DSN: z.string(),

	OPEN_ROUTER_MODEL: z.string(),
	OPEN_ROUTER_API_KEY: z.string(),

	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_BOT_USERNAME: z.string(),
	TELEGRAM_ALLOWED_CHANNEL: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);
