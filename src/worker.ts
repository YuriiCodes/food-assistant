import "./config/sentry.ts";
import "./config/env.ts";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Bot } from "grammy";
import { ENV } from "./config/env.ts";
import { db } from "./db";
import { createLogger } from "./lib/logger.ts";
import { createMealWorker } from "./queue/calories-intake.worker.ts";
import { LlmFoodCalorieExtractorService } from "./services/llm/llm-food-calorie-extractor.service.ts";
import { MealsService } from "./services/meals.service.ts";

const logger = createLogger("worker");

const mealsService = new MealsService(db);

const openrouter = createOpenRouter({
	apiKey: ENV.OPEN_ROUTER_API_KEY,
});
const llmModel = openrouter(ENV.OPEN_ROUTER_MODEL);
const foodCalorieExtractorService = new LlmFoodCalorieExtractorService(
	llmModel,
);

const bot = new Bot(ENV.TELEGRAM_BOT_TOKEN);

export const mealWorker = createMealWorker(
	bot.api,
	mealsService,
	foodCalorieExtractorService,
);

logger.info("⚡ Worker started!");

process.on("SIGTERM", async () => {
	logger.info("Receiving SIGTERM, closing connection");
	await mealWorker.close();
});

process.on("SIGINT", async () => {
	logger.info("Receiving SIGINT, closing connection");
	await mealWorker.close();
});
