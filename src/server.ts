import "./config/env.ts";
import "./config/sentry.ts";
import { createRedisConnection } from "./cache";
import { ENV } from "./config/env.ts";
import { createDatabase } from "./db";
import { TelegramBot } from "./handlers/telegram";
import { createCaloriesIntakeQueue } from "./queue/calories-intake-bull.queue.ts";

import { MealsService } from "./services/meals.service.ts";
import { UsersService } from "./services/users.service.ts";

const database = createDatabase(ENV.DATABASE_URL);
const { conn: redisConn } = createRedisConnection(ENV.REDIS_URL);

const usersService = new UsersService(database);
const mealsService = new MealsService(database);

const mealQueue = createCaloriesIntakeQueue(redisConn);

const telegramBot = new TelegramBot(usersService, mealsService, mealQueue);

void telegramBot.startPolling();
