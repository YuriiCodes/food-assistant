import type { Context, MiddlewareFn } from "grammy";
import { ENV } from "../../../config/env.ts";
import { createLogger } from "../../../lib/logger.ts";

const logger = createLogger("withAllowedChannel");

export const withAllowedChannel: MiddlewareFn<Context> = async (ctx, next) => {
	const chatId = ctx.chat?.id;
	if (chatId === undefined) {
		logger.warn("Received update without chat - skipping");
		return;
	}

	if (!ENV.TELEGRAM_ALLOWED_CHANNEL.includes(chatId)) {
		logger.warn(
			{ chatId, username: ctx.chat?.username ?? "unknown" },
			"Received message from unknown chat - skipping",
		);
		return;
	}

	return next();
};
