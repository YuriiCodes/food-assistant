import {UsersService} from "../../services/users.service.ts";
import {type Attachment, Chat} from "chat";
import {createMemoryState} from "@chat-adapter/state-memory";
import {createTelegramAdapter} from "@chat-adapter/telegram";
import type {FoodAnalysisResult} from "../../llm/schemas.ts";
import {analyzeFoodImage} from "../../llm";
import {withAllowedChannel} from "./middlewares/with-allowed-channel.ts";
import type {MealsService} from "../../services/meals.service.ts";


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

    constructor(private readonly usersService: UsersService, private readonly mealsService: MealsService) {
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

                    await this.mealsService.create({
                        userId: user.id,
                        rawText: message?.text,
                        imageFileId: fileId,
                        ...analysis,
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

    private craftMessage({carbs, totalCalories, fats, protein}: FoodAnalysisResult): string {
        return `
🍽️ Food Analysis Results:

Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
                `.trim();
    }

    public async startPolling(): Promise<void> {
        void this.bot.initialize()
    }
}