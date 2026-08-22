import type { Api } from "grammy";
import { InlineKeyboard } from "grammy";
import { redisConn } from "../cache";
import { buildDeleteMealCallbackData } from "../lib/callback-data.ts";
import { createLogger } from "../lib/logger.ts";
import type { FoodCalorieExtractor } from "../services/llm/food-calorie-extractor.interface.ts";
import type { FoodAnalysisResult } from "../services/llm/schemas.ts";
import type { MealsService } from "../services/meals.service.ts";
import type { TelegramMediaService } from "../services/telegram-media.service.ts";
import { BullMQWorkerAdapter } from "./adapters/bullmq-worker.adapter.ts";
import {
	CALORIES_INTAKE_JOB_NAMES,
	type CaloriesIntakeJob,
} from "./calories-intake.job.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";

const logger = createLogger(createMealWorker.name);

function craftDeleteMealKeyboard(mealId: number): InlineKeyboard {
	return InlineKeyboard.from([
		[InlineKeyboard.text("🗑 Delete meal", buildDeleteMealCallbackData(mealId))],
	]);
}

function craftMessage({
	carbs,
	totalCalories,
	fats,
	protein,
	description,
}: FoodAnalysisResult): string {
	return `
🍽️*${description}*:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
    `.trim();
}

async function acknowledge(
	api: Api,
	chatId: number,
	messageId: number,
): Promise<void> {
	try {
		await api.setMessageReaction(chatId, messageId, [
			{ type: "emoji", emoji: "👀" },
		]);
		logger.info({ chatId, messageId }, "acknowledged");
	} catch {
		logger.error(
			{ messageId, chatId },
			"error sending loading emoji to message",
		);
	}
}

export function createMealWorker(
	api: Api,
	mealsService: MealsService,
	foodCalorieExtractorService: FoodCalorieExtractor,
	telegramMediaService: TelegramMediaService,
) {
	return new BullMQWorkerAdapter<CaloriesIntakeJob>(
		QUEUE_NAMES.CALORIES_INTAKE_QUEUE,
		{
			[CALORIES_INTAKE_JOB_NAMES.TEXT]: async (job) => {
				const { userId, chatId, messageId, rawText } = job.payload;
				logger.info({ userId, chatId, messageId }, "received text meal job");

				await acknowledge(api, chatId, messageId);

				try {
					const analysis = await foodCalorieExtractorService.fromText({
						description: rawText,
					});
					logger.info(
						{
							userId,
							chatId,
							messageId,
							totalCalories: analysis.totalCalories,
						},
						"extracted calories from text",
					);

					const meal = await mealsService.create({
						userId,
						rawText,
						...analysis,
					});
					logger.info({ userId, chatId, messageId }, "persisted meal");

					await api.sendMessage(chatId, craftMessage(analysis), {
						reply_parameters: { message_id: messageId },
						reply_markup: craftDeleteMealKeyboard(meal.id),
					});
					logger.info({ userId, chatId, messageId }, "sent analysis reply");
				} catch (err) {
					logger.error(
						{ err, userId, chatId, messageId },
						"failed to process text meal job",
					);
					throw err;
				}
			},
			[CALORIES_INTAKE_JOB_NAMES.IMAGE]: async (job) => {
				const { userId, chatId, messageId, caption, imageFileId } = job.payload;
				logger.info(
					{ userId, chatId, messageId, hasCaption: Boolean(caption) },
					"received image meal job",
				);

				await acknowledge(api, chatId, messageId);

				try {
					const { buffer, mimeType } =
						await telegramMediaService.fetchImage(imageFileId);
					const imageBase64Url = telegramMediaService.toDataUrl(
						buffer,
						mimeType,
					);
					logger.info(
						{ userId, chatId, messageId, bytes: buffer.byteLength },
						"fetched image from telegram",
					);

					const analysis = caption
						? await foodCalorieExtractorService.fromTextAndImage({
								description: caption,
								imageBase64Url,
							})
						: await foodCalorieExtractorService.fromImage({ imageBase64Url });
					logger.info(
						{
							userId,
							chatId,
							messageId,
							totalCalories: analysis.totalCalories,
						},
						"extracted calories from image",
					);

					const meal = await mealsService.create({
						userId,
						rawText: caption,
						imageFileId,
						...analysis,
					});
					logger.info({ userId, chatId, messageId }, "persisted meal");

					await api.sendMessage(chatId, craftMessage(analysis), {
						reply_parameters: { message_id: messageId },
						reply_markup: craftDeleteMealKeyboard(meal.id),
					});
					logger.info({ userId, chatId, messageId }, "sent analysis reply");
				} catch (err) {
					logger.error(
						{ err, userId, chatId, messageId },
						"failed to process image meal job",
					);
					throw err;
				}
			},
		},
		redisConn,
		{ concurrency: 5 },
	);
}
