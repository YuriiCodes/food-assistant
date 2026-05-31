import type { Context } from "grammy";
import { Composer } from "grammy";
import { ENV } from "../../../config/env.ts";
import type { FoodCalorieExtractor } from "../../../services/llm/food-calorie-extractor.interface.ts";
import type { FoodAnalysisResult } from "../../../services/llm/schemas.ts";
import type { MealsService } from "../../../services/meals.service.ts";
import type { AppContext } from "../types/app-context.ts";

export function createImageHandler(
	mealsService: MealsService,
	foodCalorieExtractorService: FoodCalorieExtractor,
) {
	const composer = new Composer<AppContext>();

	composer.on("message:photo", async (ctx) => {
		const photo = ctx.message.photo.at(-1);

		if (!photo) {
			throw new Error("No photo provided");
		}

		const { imageBase64Url, fileId } = await extractImage(ctx, photo.file_id);

		let analysis: FoodAnalysisResult | null;

		if (ctx?.message?.caption) {
			analysis = await foodCalorieExtractorService.fromTextAndImage({
				description: ctx.message.caption,
				imageBase64Url,
			});
		} else {
			analysis = await foodCalorieExtractorService.fromImage({
				imageBase64Url,
			});
		}

		await mealsService.create({
			userId: ctx.user.id,
			rawText: ctx.message.caption,
			imageFileId: fileId,
			...analysis,
		});

		await ctx.reply(craftMessage(analysis));
	});

	return composer;
}

async function extractImage(
	ctx: Context,
	fileId: string,
): Promise<{ imageBase64Url: string; fileId: string }> {
	const file = await ctx.api.getFile(fileId);
	const filePath = file.file_path;
	if (!filePath) throw new Error("No file_path returned from Telegram");

	const telegramUrl = `https://api.telegram.org/file/bot${ENV.TELEGRAM_BOT_TOKEN}/${filePath}`;
	const response = await fetch(telegramUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	const base64 = buffer.toString("base64");
	const ext = filePath.split(".").pop()?.toLowerCase();
	const mimeType = ext === "png" ? "image/png" : "image/jpeg";

	return { imageBase64Url: `data:${mimeType};base64,${base64}`, fileId };
}

function craftMessage({
	carbs,
	totalCalories,
	fats,
	protein,
}: FoodAnalysisResult): string {
	return `
🍽️ Food Analysis Results:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
    `.trim();
}
