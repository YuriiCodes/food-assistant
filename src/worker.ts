import "./config/env.ts";
import "./config/sentry.ts";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { RedisClient } from "bun";
import { Bot } from "grammy";
import { createRedisConnection } from "./cache";
import { ENV } from "./config/env.ts";
import { Sentry } from "./config/sentry.ts";
import { createDatabase } from "./db";
import { createRedisEventBus } from "./events/event-bus.ts";
import { createLogger } from "./lib/logger.ts";
import { createMealWorker } from "./queue/calories-intake.worker.ts";
import { createFastingWorker } from "./queue/fasting.worker.ts";
import { createFastingQueue } from "./queue/fasting-bull.queue.ts";
import { LlmFoodCalorieExtractorService } from "./services/llm/llm-food-calorie-extractor.service.ts";
import { MealsService } from "./services/meals.service.ts";
import { TelegramMediaService } from "./services/telegram-media.service.ts";
import { UserSettingsService } from "./services/user-settings.service.ts";
import { subscribeFastingAutoStart } from "./subscribers/fasting-auto-start.subscriber.ts";

const logger = createLogger("worker");

const database = createDatabase(ENV.DATABASE_URL);
const { rawClient, conn: redisConn } = createRedisConnection(ENV.REDIS_URL);

const mealsService = new MealsService(database);
const userSettingsService = new UserSettingsService(database);

const eventBusPublisher = new RedisClient(ENV.REDIS_URL);
const eventBusSubscriber = new RedisClient(ENV.REDIS_URL);
const eventBus = createRedisEventBus(eventBusPublisher, eventBusSubscriber);

const openrouter = createOpenRouter({
	apiKey: ENV.OPEN_ROUTER_API_KEY,
});
const llmModel = openrouter(ENV.OPEN_ROUTER_MODEL);
const foodCalorieExtractorService = new LlmFoodCalorieExtractorService(
	llmModel,
);

const bot = new Bot(ENV.TELEGRAM_BOT_TOKEN);
const telegramMediaService = new TelegramMediaService(bot.api);

export const mealWorker = createMealWorker(
	bot.api,
	mealsService,
	foodCalorieExtractorService,
	telegramMediaService,
	redisConn,
	eventBus,
);

export const fastingWorker = createFastingWorker(bot.api, redisConn);

const fastingQueue = createFastingQueue(redisConn);

export const unsubscribeFastingAutoStart = await subscribeFastingAutoStart({
	api: bot.api,
	mealsService,
	userSettingsService,
	fastingQueue,
	eventBus,
});

logger.info("⚡ Worker started!");

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
	if (shuttingDown) return;
	shuttingDown = true;

	logger.info({ signal }, "Shutting down worker...");
	await unsubscribeFastingAutoStart();
	await mealWorker.close();
	await fastingWorker.close();
	eventBusPublisher.close();
	eventBusSubscriber.close();
	rawClient.close();
	await database.$client.end();
	await Sentry.flush(2000);
	logger.info("Worker stopped");
}

process.once("SIGTERM", (signal) => void shutdown(signal));
process.once("SIGINT", (signal) => void shutdown(signal));
