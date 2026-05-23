import { Bot, type Context } from "grammy";
import { UsersService } from "../../services/users.service.ts";
import type { FoodAnalysisResult } from "../../llm/schemas.ts";
import { analyzeFoodImage } from "../../llm";
import { withAllowedChannel } from "./middlewares/with-allowed-channel.ts";
import type { MealsService } from "../../services/meals.service.ts";
import { ENV } from "../../config/env.ts";

export class TelegramBot {
    private bot = new Bot(ENV.TELEGRAM_BOT_TOKEN);

    constructor(
        private readonly usersService: UsersService,
        private readonly mealsService: MealsService,
    ) {
        this.bot.on("message", withAllowedChannel(async (ctx) => {
            console.log("received new message");

            if(!ctx.message) {
                console.warn("no message- returning")
                return
            }
            const from = ctx.message.from;

            const user = await this.usersService.upsert({
                telegramId: String(from.id),
                firstName: [from.first_name, from.last_name].filter(Boolean).join(" "),
                username: from.username,
            });

            const photoSizes = ctx.message?.photo;
            if (!photoSizes?.length) {
                await ctx.reply("Please provide an image");
                return;
            }
            const photo = photoSizes[photoSizes.length - 1];
            if (!photo) {
                await ctx.reply("Please provide an image");
                return;
            }



            const { url: imageUrl, fileId } = await this.extractImage(ctx, photo?.file_id);

            const analysis = await analyzeFoodImage({
                imageUrl,
                text: ctx.message.caption,
            });

            await this.mealsService.create({
                userId: user.id,
                rawText: ctx.message.caption,
                imageFileId: fileId,
                ...analysis,
            });

            await ctx.reply(this.craftMessage(analysis));
        }));
    }

    private async extractImage(
        ctx: Context,
        fileId: string,
    ): Promise<{ url: string; fileId: string }> {
        const file = await ctx.api.getFile(fileId);
        const filePath = file.file_path;
        if (!filePath) throw new Error("No file_path returned from Telegram");

        const token = ENV.TELEGRAM_BOT_TOKEN;
        const telegramUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

        const response = await fetch(telegramUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");

        // Derive mime type from extension; default to jpeg
        const ext = filePath.split(".").pop()?.toLowerCase();
        const mimeType = ext === "png" ? "image/png" : "image/jpeg";
        const url = `data:${mimeType};base64,${base64}`;

        console.log("Extracted image from metadata");
        return { url, fileId };
    }

    private craftMessage({ carbs, totalCalories, fats, protein }: FoodAnalysisResult): string {
        return `
🍽️ Food Analysis Results:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
        `.trim();
    }

    public async start(): Promise<void> {
        console.log("starting telegram bot")
        void this.bot.start();
        console.log("bot started!")
    }
}