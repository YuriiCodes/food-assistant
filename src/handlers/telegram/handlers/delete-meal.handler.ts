import { Composer } from "grammy";
import { assert } from "../../../lib/assert.ts";
import {
	DELETE_MEAL_CALLBACK_REGEX,
	parseDeleteMealCallbackData,
} from "../../../lib/callback-data.ts";
import { createLogger } from "../../../lib/logger.ts";
import type { MealsService } from "../../../services/meals.service.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger("createDeleteMealHandler");

export function createDeleteMealHandler(
	mealsService: MealsService,
): Composer<AppContext> {
	const composer = new Composer<AppContext>();

	composer.callbackQuery(DELETE_MEAL_CALLBACK_REGEX, async (ctx) => {
		const data = ctx.callbackQuery.data;
		const mealId = parseDeleteMealCallbackData(data);

		if (mealId === null) {
			await ctx.answerCallbackQuery({ text: "Invalid request." });
			return;
		}

		assert(ctx.user, "delete meal handler ran without with-user middleware");
		const userId = ctx.user.id;

		const deleted = await mealsService.delete(mealId, userId);

		if (!deleted) {
			logger.warn({ userId, mealId }, "meal not found or not owned by user");
			await ctx.editMessageText("Meal already deleted.", {
				reply_markup: undefined,
			});
			await ctx.answerCallbackQuery({
				text: "Meal already deleted.",
				show_alert: true,
			});
			return;
		}

		await ctx.editMessageText("🗑 Meal deleted.");
		await ctx.answerCallbackQuery({ text: "Meal deleted" });

		logger.info({ userId, mealId }, "meal deleted");
	});

	return composer;
}
