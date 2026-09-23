import { Composer } from "grammy";
import { FASTING_CONFIG } from "../../../config/fasting.ts";
import { assert } from "../../../lib/assert.ts";
import { createLogger } from "../../../lib/logger.ts";
import {
	formatInTimeZone,
	getEndDelayMs,
	getFastingWindow,
	getReminderDelayMs,
} from "../../../lib/time-utils.ts";
import {
	FASTING_JOB_NAMES,
	type FastingJob,
} from "../../../queue/fasting.job.ts";
import type { Queue } from "../../../queue/queue.interface.ts";
import type { AppContext } from "../types/app-context.ts";

const logger = createLogger(createFastingHandler.name);

export function createFastingHandler(fastingQueue: Queue<FastingJob>) {
	const composer = new Composer<AppContext>();

	composer.command("start_fasting", async (ctx) => {
		assert(ctx.user, "fasting handler ran without with-user middleware");
		const userId = ctx.user.id;
		const chatId = ctx.chat.id;

		// Telegram message date is Unix time (UTC, authoritative).
		const startAt = ctx.message?.date
			? new Date(ctx.message.date * 1000)
			: new Date();
		const { endsAt } = getFastingWindow(
			startAt,
			FASTING_CONFIG.eatingWindowHours,
		);
		const now = new Date();

		await ctx.reply(
			`Your last food intake should be by ${formatInTimeZone(endsAt, FASTING_CONFIG.timezone)}. Tracking started!`,
		);

		const windowStartISO = startAt.toISOString();
		const windowEndISO = endsAt.toISOString();

		for (const hoursBeforeEnd of FASTING_CONFIG.remindersBeforeEndHours) {
			await fastingQueue.add(
				{
					name: FASTING_JOB_NAMES.REMINDER,
					payload: {
						userId,
						chatId,
						windowStartISO,
						windowEndISO,
						kind: "before-end",
						hoursBeforeEnd,
					},
				},
				{ delay: getReminderDelayMs(endsAt, now, hoursBeforeEnd) },
			);
		}

		await fastingQueue.add(
			{
				name: FASTING_JOB_NAMES.REMINDER,
				payload: {
					userId,
					chatId,
					windowStartISO,
					windowEndISO,
					kind: "ended",
				},
			},
			{ delay: getEndDelayMs(endsAt, now) },
		);

		logger.info(
			{ userId, chatId, windowStartISO, windowEndISO },
			"started fasting window",
		);
	});

	return composer;
}
