import "./config/sentry.ts";
import "./config/env.ts";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ENV } from "./config/env.ts";
import { db } from "./db";
import { TelegramBot } from "./handlers/telegram";
import { CaloriesIntakeJob } from "./queue/calories-intake.job.ts";
import { caloriesIntakeQueue } from "./queue/calories-intake-bull.queue.ts";
import { LlmFoodCalorieExtractorService } from "./services/llm/llm-food-calorie-extractor.service.ts";
import { MealsService } from "./services/meals.service.ts";
import { UsersService } from "./services/users.service.ts";

const usersService = new UsersService(db);
const mealsService = new MealsService(db);

const openrouter = createOpenRouter({
	apiKey: ENV.OPEN_ROUTER_API_KEY,
});
const llmModel = openrouter(ENV.OPEN_ROUTER_MODEL);
const foodCalorieExtractorService = new LlmFoodCalorieExtractorService(
	llmModel,
);

await caloriesIntakeQueue.add(new CaloriesIntakeJob({ color: "red" }));

const telegramBot = new TelegramBot(
	usersService,
	mealsService,
	foodCalorieExtractorService,
);

void telegramBot.startPolling();
