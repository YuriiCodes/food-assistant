import type { Context } from "grammy";
import { Composer } from "grammy";
import { ENV } from "../../../config/env.ts";
import { createLogger } from "../../../lib/logger.ts";
import {
	CALORIES_INTAKE_JOB_NAMES,
	type CaloriesIntakeJob,
} from "../../../queue/calories-intake.job.ts";
import type { Queue } from "../../../queue/queue.interface.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger(createImageHandler.name);

export function createImageHandler(mealQueue: Queue<CaloriesIntakeJob>) {
	const composer = new Composer<AppContext>();

	composer.on("message:photo", async (ctx) => {
		const chatId = ctx.chat.id;
		const messageId = ctx.message.message_id;
		const userId = ctx.user.id;

		logger.info({ userId, chatId, messageId }, "received photo message");

		const photo = ctx.message.photo.at(-1);
		if (!photo) {
			logger.error({ userId, chatId, messageId }, "no photo found on message");
			throw new Error("No photo provided");
		}

		let imageBase64Url: string;
		let fileId: string;

		try {
			({ imageBase64Url, fileId } = await extractImage(ctx, photo.file_id));
			logger.info(
				{ userId, chatId, messageId, fileId },
				"extracted image from telegram",
			);
		} catch (err) {
			logger.error(
				{ err, userId, chatId, messageId },
				"failed to extract image from telegram",
			);
			throw err;
		}

		await mealQueue.add({
			name: CALORIES_INTAKE_JOB_NAMES.IMAGE,
			payload: {
				userId,
				chatId,
				messageId,
				caption: ctx.message.caption,
				imageBase64Url,
				imageFileId: fileId,
			},
		});
		logger.info({ userId, chatId, messageId }, "enqueued image meal job");
	});

	return composer;
}

async function extractImage(
	ctx: Context,
	fileId: string,
): Promise<{ imageBase64Url: string; fileId: string }> {
	const file = await ctx.api.getFile(fileId);
	const filePath = file.file_path;
	if (!filePath) throw new Error("No file_path returned from Telegram");

	const telegramUrl = `https://api.telegram.org/file/bot${ENV.TELEGRAM_BOT_TOKEN}/${filePath}`;
	const response = await fetch(telegramUrl);
	if (!response.ok)
		throw new Error(`Failed to fetch image: ${response.statusText}`);

	const buffer = Buffer.from(await response.arrayBuffer());
	const base64 = buffer.toString("base64");
	const ext = filePath.split(".").pop()?.toLowerCase();
	const mimeType = ext === "png" ? "image/png" : "image/jpeg";

	return { imageBase64Url: `data:${mimeType};base64,${base64}`, fileId };
}
