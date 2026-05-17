import {createTelegramAdapter} from "@chat-adapter/telegram";
import {type Attachment, Chat} from "chat";
import {createMemoryState} from "@chat-adapter/state-memory";
import {analyzeFoodImage} from "../llm/index.js";
import type {FoodAnalysis} from "../llm/schemas.ts";

import {withUserUpsert} from "./middlewares/with-user-upsert.ts";
import {withAllowedChannel} from "./middlewares/with-allowed-channel.ts";

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
    withAllowedChannel(
        withUserUpsert(async (thread, message, channel, context) => {
            const imageAttachment = message.attachments.find(att => att.type === 'image');
            if (!imageAttachment) {
                await thread.post("Please provide an image");
                return;
            }

            const {url: imageUrl} = await extractImage(imageAttachment);

            const analysis = await analyzeFoodImage({
                imageUrl,
                text: message?.text
            });

            const resultMessage = craftMessage(analysis);
            await thread.post(resultMessage);
        })
    )
);

