import { Composer } from "grammy";
import { createLogger } from "../../../lib/logger.ts";
import {
	CALORIES_INTAKE_JOB_NAMES,
	type CaloriesIntakeJob,
} from "../../../queue/calories-intake.job.ts";
import type { Queue } from "../../../queue/queue.interface.ts";
import type { TelegramMediaService } from "../../../services/telegram-media.service.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger(createImageHandler.name);

export function createImageHandler(
	mealQueue: Queue<CaloriesIntakeJob>,
	telegramMediaService: TelegramMediaService,
) {
	const composer = new Composer<AppContext>();

	composer.on("message:photo", async (ctx) => {
		const chatId = ctx.chat.id;
		const messageId = ctx.message.message_id;
		const userId = ctx.user.id;

		logger.info({ userId, chatId, messageId }, "received photo message");

		const photo = telegramMediaService.pickPhotoSize(ctx.message.photo);
		if (!photo) {
			logger.error({ userId, chatId, messageId }, "no photo found on message");
			throw new Error("No photo provided");
		}
		logger.info(
			{
				userId,
				chatId,
				messageId,
				imageFileId: photo.file_id,
				width: photo.width,
			},
			"selected photo size",
		);

		await mealQueue.add({
			name: CALORIES_INTAKE_JOB_NAMES.IMAGE,
			payload: {
				userId,
				chatId,
				messageId,
				caption: ctx.message.caption,
				imageFileId: photo.file_id,
			},
		});
		logger.info({ userId, chatId, messageId }, "enqueued image meal job");
	});

	return composer;
}
