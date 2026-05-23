import { Bot } from "grammy";
import type { Context } from "grammy";
import { withAllowedChannel } from "./middlewares/with-allowed-channel.ts";
import { createImageHandler } from "./handlers/images.handler.ts";
import { createCommandHandler } from "./handlers/commands.handler.ts";
import type { UsersService } from "../../services/users.service.ts";
import type { MealsService } from "../../services/meals.service.ts";
import { ENV } from "../../config/env.ts";

export class TelegramBot {
    private bot = new Bot<Context>(ENV.TELEGRAM_BOT_TOKEN);

    constructor(usersService: UsersService, mealsService: MealsService) {
        // Apply allowed-channel gate to all handlers
        this.bot.use(withAllowedChannel);

        this.bot.use(createImageHandler(usersService, mealsService));
        this.bot.use(createCommandHandler(usersService));
    }

    public async startPolling(): Promise<void> {
        console.log("starting bot...")
        void this.bot.start();
        console.log("bot started")
    }
}