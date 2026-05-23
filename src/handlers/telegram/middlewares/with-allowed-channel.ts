import type { Context, MiddlewareFn } from "grammy";
import { ENV } from "../../../config/env.ts";
import { createLogger } from "../../../lib/logger.ts";

const ALLOWED_CHANNEL_IDS = [ENV.TELEGRAM_ALLOWED_CHANNEL];

const logger = createLogger("withAllowedChannel");
export const withAllowedChannel: MiddlewareFn<Context> = async (ctx, next) => {
	const chatId = String(ctx.chat?.id);
	const username = String(ctx.chat?.username);
	if (!ALLOWED_CHANNEL_IDS.includes(chatId)) {
		logger.warn(
			{ chatId, username },
			`Received message from unknown user - skipping`,
		);
		return;
	}
	return next();
};
