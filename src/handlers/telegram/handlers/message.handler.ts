import { Composer } from "grammy";
import { assert } from "../../../lib/assert.ts";
import { createLogger } from "../../../lib/logger.ts";
import {
	CALORIES_INTAKE_JOB_NAMES,
	type CaloriesIntakeJob,
} from "../../../queue/calories-intake.job.ts";
import type { Queue } from "../../../queue/queue.interface.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger(createTextHandler.name);
export function createTextHandler(mealQueue: Queue<CaloriesIntakeJob>) {
	const composer = new Composer<AppContext>();

	composer.on("message:text", async (ctx) => {
		assert(ctx.user, "text handler ran without with-user middleware");
		const userId = ctx.user.id;
		const chatId = ctx.chat.id;
		const messageId = ctx.message.message_id;

		await mealQueue.add({
			name: CALORIES_INTAKE_JOB_NAMES.TEXT,
			payload: {
				userId,
				chatId,
				messageId,
				rawText: ctx.message.text,
			},
		});

		logger.info({ userId, chatId, messageId }, "enqueued text meal job");
	});

	return composer;
}
