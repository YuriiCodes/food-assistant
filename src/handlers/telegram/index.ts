import { Bot } from "grammy";
import { ENV } from "../../config/env.ts";
import { createLogger } from "../../lib/logger.ts";
import type { MealsService } from "../../services/meals.service.ts";
import type { UsersService } from "../../services/users.service.ts";
import { createCommandHandler } from "./handlers/commands.handler.ts";
import { createImageHandler } from "./handlers/images.handler.ts";
import { withAllowedChannel } from "./middlewares/with-allowed-channel.ts";
import { createUserMiddleware } from "./middlewares/with-user.ts";
import type { AppContext } from "./types/app-context.ts";

export class TelegramBot {
	private readonly logger = createLogger(this.constructor.name);
	private bot = new Bot<AppContext>(ENV.TELEGRAM_BOT_TOKEN);

	constructor(usersService: UsersService, mealsService: MealsService) {
		this.bot.use(withAllowedChannel);
		this.bot.use(createUserMiddleware(usersService));
		this.bot.use(createImageHandler(mealsService));
		this.bot.use(createCommandHandler());
	}

	public async startPolling(): Promise<void> {
		this.logger.info("starting Telegram bot...");
		void this.bot.start();
		this.logger.info("⚡ Telegram bot started");
	}
}
