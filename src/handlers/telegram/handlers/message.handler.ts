import { Composer } from "grammy";
import type { FoodCalorieExtractor } from "../../../services/llm/food-calorie-extractor.interface.ts";
import type { MealsService } from "../../../services/meals.service.ts";
import type { AppContext } from "../types/app-context.ts";
import { craftMessage } from "../utils/craft-message.ts";

export function createTextHandler(
	mealsService: MealsService,
	foodCalorieExtractorService: FoodCalorieExtractor,
) {
	const composer = new Composer<AppContext>();

	composer.on("message:text", async (ctx) => {
		const description = ctx.message.text;

		const analysis = await foodCalorieExtractorService.fromText({
			description,
		});

		await mealsService.create({
			userId: ctx.user.id,
			rawText: description,
			...analysis,
		});

		await ctx.reply(craftMessage(analysis));
	});

	return composer;
}
