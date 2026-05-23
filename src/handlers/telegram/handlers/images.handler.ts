import { Composer } from "grammy";
import type { Context } from "grammy";
import type { UsersService } from "../../../services/users.service.ts";
import type { MealsService } from "../../../services/meals.service.ts";
import { analyzeFoodImage } from "../../../llm/index.ts";
import type { FoodAnalysisResult } from "../../../llm/schemas.ts";
import { ENV } from "../../../config/env.ts";

export function createImageHandler(usersService: UsersService, mealsService: MealsService) {
    const composer = new Composer<Context>();

    composer.on("message:photo", async (ctx) => {
        const from = ctx.message.from;

        const user = await usersService.upsert({
            telegramId: String(from.id),
            firstName: [from.first_name, from.last_name].filter(Boolean).join(" "),
            username: from.username,
        });

        const photo = ctx.message.photo.at(-1)!;
        const { url: imageUrl, fileId } = await extractImage(ctx, photo.file_id);

        const analysis = await analyzeFoodImage({
            imageUrl,
            text: ctx.message.caption,
        });

        await mealsService.create({
            userId: user.id,
            rawText: ctx.message.caption,
            imageFileId: fileId,
            ...analysis,
        });

        await ctx.reply(craftMessage(analysis));
    });

    return composer;
}

async function extractImage(ctx: Context, fileId: string): Promise<{ url: string; fileId: string }> {
    const file = await ctx.api.getFile(fileId);
    const filePath = file.file_path;
    if (!filePath) throw new Error("No file_path returned from Telegram");

    const telegramUrl = `https://api.telegram.org/file/bot${ENV.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(telegramUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");
    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    return { url: `data:${mimeType};base64,${base64}`, fileId };
}

function craftMessage({ carbs, totalCalories, fats, protein }: FoodAnalysisResult): string {
    return `
🍽️ Food Analysis Results:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
    `.trim();
}