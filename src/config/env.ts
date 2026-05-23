import process from "node:process";
import { z } from "zod";

const envSchema = z.object({
	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_BOT_USERNAME: z.string(),
	TELEGRAM_API_BASE_URL: z.string(),
	OPEN_ROUTER_API_KEY: z.string(),
	TELEGRAM_ALLOWED_CHANNEL: z.string(),
	DATABASE_URL: z.string().nonoptional(),
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);
