import { Composer, InlineKeyboard } from "grammy";
import type { NutritionReportFormatter } from "../../../formatters/nutrition-report-formatter.interface.ts";
import { createLogger } from "../../../lib/logger.ts";
import { getDailyRange, getWeeklyRange } from "../../../lib/time.ts";
import type { MealsService } from "../../../services/meals.service.ts";
import type { AppContext } from "../types/app-context.ts";

type TimeframeLabel = {
	label: string;
	value: string;
	getRange: () => { from: Date; to: Date };
};

const DAILY_TIMEFRAME: TimeframeLabel = {
	label: "Today",
	value: "daily",
	getRange: getDailyRange,
};

const WEEKLY_TIMEFRAME: TimeframeLabel = {
	label: "This week",
	value: "weekly",
	getRange: getWeeklyRange,
};

const TIMEFRAMES = [DAILY_TIMEFRAME, WEEKLY_TIMEFRAME] as const;
const TIMEFRAMES_FOR_ANALYSIS = TIMEFRAMES.map(
	({ label, value }) => [label, value] as const,
);

const logger = createLogger("createCommandHandler");
export function createCommandHandler(
	mealsService: MealsService,
	formatter: NutritionReportFormatter,
) {
	const composer = new Composer<AppContext>();

	composer.command("start", async (ctx) => {
		await ctx.reply("Welcome! Send me a photo of your meal to analyze it.");
	});

	composer.command("help", async (ctx) => {
		await ctx.reply(
			"Send any food photo and I'll break down its calories and macros.",
		);
	});

	composer.command("macros", async (ctx) => {
		const buttonRow = TIMEFRAMES_FOR_ANALYSIS.map(([label, data]) =>
			InlineKeyboard.text(label, data),
		);
		await ctx.reply("📊 Choose a timeframe:", {
			reply_markup: InlineKeyboard.from([buttonRow]),
		});
	});

	for (const timeframe of TIMEFRAMES) {
		composer.callbackQuery(timeframe.value, async (ctx) => {
			await ctx.answerCallbackQuery();

			const userId = ctx.from?.id;
			if (!userId) {
				await ctx.reply("Could not identify user.");
				return;
			}

			const dbUserId = ctx.user.id;
			const { from, to } = timeframe.getRange();
			const aggregate = await mealsService.aggregateNutritionalInfo(
				dbUserId,
				from,
				to,
			);

			await ctx.reply(formatter.format(aggregate, timeframe.label), {
				parse_mode: "Markdown",
			});

			logger.info({ userId }, "sent report");
		});
	}

	return composer;
}
