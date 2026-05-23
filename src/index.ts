import './config/env.ts'
import {UsersService} from "./services/users.service.ts";
import {db} from "./db";
import {TelegramBot} from "./handlers/telegram";

const usersService = new UsersService(db)
const telegramBot = new TelegramBot(usersService)

void telegramBot.startPolling();

