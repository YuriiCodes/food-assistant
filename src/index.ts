import './config/env.ts'
import {UsersService} from "./services/users.service.ts";
import {db} from "./db";
import {TelegramBot} from "./handlers/telegram";
import {MealsService} from "./services/meals.service.ts";

const usersService = new UsersService(db)
const mealsService = new MealsService(db)
const telegramBot = new TelegramBot(usersService, mealsService)

void telegramBot.startPolling();

