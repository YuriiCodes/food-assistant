import type {DirectMessageHandler} from "chat";
import {ENV} from "../../../config/env.ts";



const ALLOWED_CHANNEL_IDS = [ENV.TELEGRAM_ALLOWED_CHANNEL]

export const withAllowedChannel = (handler: DirectMessageHandler): DirectMessageHandler => {
    return async (thread, message, channel, context) => {
        if (!ALLOWED_CHANNEL_IDS.includes(thread.channelId)) {
            console.warn(`Unknown user from channel ${thread.channelId} - skipping`);
            return;
        }

        return handler(thread, message, channel, context);
    };
};