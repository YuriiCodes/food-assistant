import {createTelegramAdapter} from "@chat-adapter/telegram";
import {type Attachment, type Author, Chat} from "chat";
import {createMemoryState} from "@chat-adapter/state-memory";
import {analyzeFoodImage} from "../llm/index.ts";
import type {FoodAnalysis} from "../llm/schemas.ts";
import {withAllowedChannel} from "./middlewares/with-allowed-channel.ts";
import {db} from "../db/index.ts";
import {meals, type User, users} from "../db/schema.ts";

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


const extractImage = async (attachment: Attachment): Promise<{ url: string, fileId: string }> => {
    const imageBuffer = await attachment.fetchData?.()
    if (!imageBuffer) {
        throw new Error("No buffer")
    }

    const base64 = imageBuffer.toString('base64');
    const mimeType = attachment.mimeType ?? 'image/jpeg';
    const url = `data:${mimeType};base64,${base64}`;
    return {url, fileId: attachment!.fetchMetadata!.fileId!}
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

const ensureUserExists = async (author: Author) => {
    const [user] = await db.insert(users).values({
        telegramId: author.userId,
        firstName: author.fullName,
        username: author.userName
    }).onConflictDoUpdate({
        target: users.telegramId,
        set: {
            firstName: author.fullName,
            username: author.userName
        }
    }).returning()
    if (!user) {
        throw new Error("Error upserting user")
    }

    return user
}

const saveUserMeal = async ({user, schema, text, imageFileId}:{user: User, schema: FoodAnalysis, text: string, imageFileId: string}) => {
    const [record] = await db.insert(meals).values({
        userId: user.id,
        rawText: text,
        totalCalories: schema.total_calories,
        carbs: schema.carbs,
        protein: schema.protein,
        fats: schema.fats,
        imageFileId,
    }).returning()

    return record
}

bot.onDirectMessage(
    withAllowedChannel(async (thread, message) => {
            const user = await ensureUserExists(message.author)

            const imageAttachment = message.attachments.find(att => att.type === 'image');
            if (!imageAttachment) {
                await thread.post("Please provide an image");
                return;
            }

            const {url: imageUrl, fileId} = await extractImage(imageAttachment);

            const analysis = await analyzeFoodImage({
                imageUrl,
                text: message?.text
            });

            await saveUserMeal({
                user,
                imageFileId: fileId,
                schema: analysis,
                text: message?.text,
            })

            const resultMessage = craftMessage(analysis);
            await thread.post(resultMessage);
        }
    )
);

