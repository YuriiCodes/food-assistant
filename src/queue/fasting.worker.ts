import type { IRedisClient } from "bullmq";
import type { Api } from "grammy";
import { FASTING_CONFIG } from "../config/fasting.ts";
import { createLogger } from "../lib/logger.ts";
import { formatHoursLabel, formatInTimeZone } from "../lib/time-utils.ts";
import { BullMQWorkerAdapter } from "./adapters/bullmq-worker.adapter.ts";
import { FASTING_JOB_NAMES, type FastingJob } from "./fasting.job.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";
import type { Worker as DomainWorker } from "./worker.interface.ts";

const logger = createLogger(createFastingWorker.name);

export function craftFastingReminderMessage(
	windowEndISO: string,
	hoursBeforeEnd: number,
	timezone: string = FASTING_CONFIG.timezone,
): string {
	const endsAt = new Date(windowEndISO);
	return `Reminder: your last food intake is in ${formatHoursLabel(hoursBeforeEnd)}, ${formatInTimeZone(endsAt, timezone)}.`;
}

export function craftFastingEndedMessage(
	windowEndISO: string,
	timezone: string = FASTING_CONFIG.timezone,
): string {
	const endsAt = new Date(windowEndISO);
	return `Your eating window is over (${formatInTimeZone(endsAt, timezone)}). Fasting started — see you tomorrow!`;
}

export function createFastingWorker(
	api: Api,
	connection: IRedisClient,
): DomainWorker {
	return new BullMQWorkerAdapter<FastingJob>(
		QUEUE_NAMES.FASTING_QUEUE,
		{
			[FASTING_JOB_NAMES.REMINDER]: async (job) => {
				const { userId, chatId, windowEndISO, kind, hoursBeforeEnd } =
					job.payload;
				logger.info(
					{ userId, chatId, kind, hoursBeforeEnd },
					"received fasting reminder job",
				);

				try {
					const text =
						kind === "ended" || hoursBeforeEnd === undefined
							? craftFastingEndedMessage(windowEndISO)
							: craftFastingReminderMessage(windowEndISO, hoursBeforeEnd);
					await api.sendMessage(chatId, text);
					logger.info({ userId, chatId, kind }, "sent fasting reminder");
				} catch (err) {
					logger.error(
						{ err, userId, chatId, kind },
						"failed to process fasting reminder job",
					);
					throw err;
				}
			},
		},
		connection,
		{ concurrency: 5 },
	);
}
