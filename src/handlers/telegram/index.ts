import { Bot, GrammyError, HttpError } from "grammy";
import { ENV } from "../../config/env.ts";
import { Sentry } from "../../config/sentry.ts";
import { TextNutritionReportFormatter } from "../../formatters/text-nutrition-report-formatter.ts";
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
		const formatter = new TextNutritionReportFormatter();

		this.bot.use(withAllowedChannel);
		this.bot.use(createUserMiddleware(usersService));
		this.bot.use(createImageHandler(mealsService));
		this.bot.use(createCommandHandler(mealsService, formatter));
		this.addSentry();
		this.enableGracefulShutdown();
	}

	public async startPolling(): Promise<void> {
		this.logger.info("starting Telegram bot...");
		this.bot.start().catch((err) => {
			this.logger.error({ err }, "Telegram bot crashed");
			Sentry.captureException(err);
			process.exit(1);
		});
		this.logger.info("⚡ Telegram bot started");
	}

	private addSentry() {
		this.bot.catch((err) => {
			const ctx = err.ctx;
			const e = err.error;

			const sentryContext = {
				extra: {
					update_id: ctx.update.update_id,
					chat_id: ctx.chat?.id,
					user_id: ctx.from?.id,
				},
			};

			if (e instanceof GrammyError) {
				Sentry.captureException(e, {
					...sentryContext,
					fingerprint: ["grammy-error", e.description],
				});
				this.logger.error(
					{ update_id: ctx.update.update_id, description: e.description },
					"Grammy error",
				);
			} else if (e instanceof HttpError) {
				Sentry.captureException(e, {
					...sentryContext,
					fingerprint: ["http-error", e.message],
				});
				this.logger.error(
					{ update_id: ctx.update.update_id, err: e },
					"Could not contact Telegram",
				);
			} else {
				Sentry.captureException(e, sentryContext);
				this.logger.error(
					{ update_id: ctx.update.update_id, err: e },
					"Unknown error",
				);
			}
		});
	}

	private enableGracefulShutdown() {
		const shutdown = async (signal: string) => {
			this.logger.info({ signal }, "Shutting down Telegram bot...");
			await this.bot.stop();
			await Sentry.flush(2000);
			this.logger.info("Telegram bot stopped");
		};

		process.once("SIGINT", () => void shutdown("SIGINT"));
		process.once("SIGTERM", () => void shutdown("SIGTERM"));
	}
}
