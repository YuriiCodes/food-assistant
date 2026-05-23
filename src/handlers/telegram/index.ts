import { Bot } from "grammy";
import { ENV } from "../../config/env.ts";
import type { MealsService } from "../../services/meals.service.ts";
import type { UsersService } from "../../services/users.service.ts";
import { createCommandHandler } from "./handlers/commands.handler.ts";
import { createImageHandler } from "./handlers/images.handler.ts";
import { withAllowedChannel } from "./middlewares/with-allowed-channel.ts";
import { createUserMiddleware } from "./middlewares/with-user.ts";
import type { AppContext } from "./types/app-context.ts";

export class TelegramBot {
	private bot = new Bot<AppContext>(ENV.TELEGRAM_BOT_TOKEN);

	constructor(usersService: UsersService, mealsService: MealsService) {
		this.bot.use(withAllowedChannel);
		this.bot.use(createUserMiddleware(usersService));
		this.bot.use(createImageHandler(mealsService));
		this.bot.use(createCommandHandler(usersService));
	}

	public async startPolling(): Promise<void> {
		console.log("starting bot...");
		void this.bot.start();
		console.log("bot started");
	}
}
