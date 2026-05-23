import type { Context, MiddlewareFn } from "grammy";
import { ENV } from "../../../config/env.ts";

const ALLOWED_CHANNEL_IDS = [ENV.TELEGRAM_ALLOWED_CHANNEL];

export const withAllowedChannel = (handler: MiddlewareFn<Context>): MiddlewareFn<Context> => {
    return async (ctx, next) => {
        const chatId = String(ctx.chat?.id);
        if (!ALLOWED_CHANNEL_IDS.includes(chatId)) {
            console.warn(`Unknown user from channel ${chatId} - skipping`);
            return;
        }
        return handler(ctx, next);
    };
};