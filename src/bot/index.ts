import {createTelegramAdapter} from "@chat-adapter/telegram";
import {type Attachment, Chat, type DirectMessageHandler} from "chat";
import {createMemoryState} from "@chat-adapter/state-memory";
import {analyzeFoodImage} from "../llm/index.js";
import type {FoodAnalysis} from "../llm/schemas.ts";

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


const extractImage = async (attachment: Attachment): Promise<{ url: string }> => {
    const imageBuffer = await attachment.fetchData?.()
    if (!imageBuffer) {
        throw new Error("No buffer")
    }

    const base64 = imageBuffer.toString('base64');
    const mimeType = attachment.mimeType ?? 'image/jpeg';
    const url = `data:${mimeType};base64,${base64}`;
    return {url}
}

const craftMessage = ({carbs, total_calories, fats, protein}: FoodAnalysis): string => {
    return `
🍽️ *Food Analysis Results:*

*Calories:* ${total_calories} kcal
*Carbs:* ${carbs}g
*Protein:* ${protein}g
*Fats:* ${fats}g
                `.trim();
}

bot.onDirectMessage(
    withAllowedChannel(async (thread, message, channel, context) => {
            const imageAttachment = message.attachments.find(att => att.type === 'image');
            if (!imageAttachment) {
                await thread.post("Please provide image")
                return
            }

            const {url: imageUrl} = await extractImage(imageAttachment)


            const analysis = await analyzeFoodImage({
                imageUrl, text: message?.text
            });


            const resultMessage = craftMessage(analysis)
            await thread.post(resultMessage);
        }
    ))
;

