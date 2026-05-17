import { createTelegramAdapter } from "@chat-adapter/telegram";
import { Chat, type DirectMessageHandler } from "chat";
import { createMemoryState } from "@chat-adapter/state-memory";

const telegramAdapter = createTelegramAdapter({
    mode: "polling",
});

export const bot = new Chat({
    userName: "mybot",
    adapters: {
        telegram: telegramAdapter,
    },
    state: createMemoryState()
});

const ALLOWED_CHANNEL_IDS = [process.env.TELEGRAM_ALLOWED_CHANNEL]
const withAllowedChannel = (handler: DirectMessageHandler): DirectMessageHandler => {
    return async (thread, message, channel, context) => {
        if (!ALLOWED_CHANNEL_IDS.includes(thread.channelId)) {
            console.warn(`Unknown user from channel ${thread.channelId} - skipping`);
            return;
        }

        return handler(thread, message, channel, context);
    };
};


bot.onDirectMessage(
    withAllowedChannel(async (thread, message, channel, context) => {
        await thread.post(`You said: ${message.text}`);
    })
);