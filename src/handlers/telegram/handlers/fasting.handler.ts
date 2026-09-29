import { Composer } from "grammy";
import { assert } from "../../../lib/assert.ts";
import { createLogger } from "../../../lib/logger.ts";
import type { FastingJob } from "../../../queue/fasting.job.ts";
import type { Queue } from "../../../queue/queue.interface.ts";
import {
	formatEatingWindowEnd,
	scheduleEatingWindow,
} from "../../../services/fasting-scheduler.service.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger(createFastingHandler.name);

export function createFastingHandler(fastingQueue: Queue<FastingJob>) {
	const composer = new Composer<AppContext>();

	composer.command("start_fasting", async (ctx) => {
		assert(ctx.user, "fasting handler ran without with-user middleware");
		const userId = ctx.user.id;
		const chatId = ctx.chat.id;

		const startAt = ctx.message?.date
			? new Date(ctx.message.date * 1000)
			: new Date();

		const { windowEndISO, windowStartISO } = await scheduleEatingWindow(
			fastingQueue,
			{ userId, chatId, startAt },
		);

		await ctx.reply(
			`Your last food intake should be by ${formatEatingWindowEnd(new Date(windowEndISO))}. Tracking started!`,
		);

		logger.info(
			{ userId, chatId, windowStartISO, windowEndISO },
			"started fasting window",
		);
	});

	return composer;
}
