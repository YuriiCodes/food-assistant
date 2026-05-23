import {UsersService} from "../../services/users.service.ts";
import {type Attachment, Chat} from "chat";
import {createMemoryState} from "@chat-adapter/state-memory";
import {createTelegramAdapter} from "@chat-adapter/telegram";
import type {FoodAnalysis} from "../../llm/schemas.ts";
import {meals, type User} from "../../db/schema.ts";
import {db} from "../../db";

import {analyzeFoodImage} from "../../llm";
import {withAllowedChannel} from "./middlewares/with-allowed-channel.ts";


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

    console.log(`saved meal ${record?.id} for user ${user.id}`)

    return record
}

export class TelegramBot {
    private bot = new Chat({
        userName: "mybot",
        adapters: {
            telegram: createTelegramAdapter({
                mode: "polling",
            }),
        },
        state: createMemoryState()
    })

    constructor(private readonly usersService: UsersService) {
        // TODO: mv to separate handlers
        this.bot.onDirectMessage(
            withAllowedChannel(async (thread, message) => {
                const {author} = message
                    console.log("received new message")
                    const user = await this.usersService.upsert({
                        telegramId: author.userId,
                        firstName: author.fullName,
                        username: author.userName
                    })

                    const imageAttachment = message.attachments.find(att => att.type === 'image');
                    if (!imageAttachment) {
                        await thread.post("Please provide an image");
                        return;
                    }

                    const {url: imageUrl, fileId} = await this.extractImage(imageAttachment);

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

                    const resultMessage = this.craftMessage(analysis);
                    await thread.post(resultMessage);
                }
            )
        );
    }

    private async extractImage(attachment: Attachment): Promise<{ url: string, fileId: string }> {
        const imageBuffer = await attachment.fetchData?.()
        if (!imageBuffer) {
            throw new Error("No buffer")
        }

        const base64 = imageBuffer.toString('base64');
        const mimeType = attachment.mimeType ?? 'image/jpeg';
        const url = `data:${mimeType};base64,${base64}`;

        console.log("Extracted image from metadata")
        return {url, fileId: attachment!.fetchMetadata!.fileId!}
    }

    private craftMessage({carbs, total_calories, fats, protein}: FoodAnalysis): string {
        return `
🍽️ Food Analysis Results:

Calories: ${total_calories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
                `.trim();
    }

    public async startPolling(): Promise<void> {
        void this.bot.initialize()
    }
}