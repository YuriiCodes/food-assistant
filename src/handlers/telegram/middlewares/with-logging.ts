import type { Context, MiddlewareFn } from "grammy";
import { createLogger } from "../../../lib/logger.ts";

const logger = createLogger("withLogging");

export const withLogging: MiddlewareFn<Context> = async (ctx, next) => {
	const chatId = String(ctx.chat?.id);
	const username = ctx.chat?.username ?? "unknown";
	const messageText = ctx.message?.text ?? ctx.channelPost?.text;
	const isCommand = messageText?.startsWith("/");

	logger.info(
		{
			chatId,
			username,
			...(isCommand ? { command: messageText } : { message: messageText }),
		},
		isCommand
			? `Incoming command: ${messageText?.split(" ")[0]}`
			: "Incoming message",
	);

	await next();
};
