import { FASTING_CONFIG } from "../config/fasting.ts";
import { createLogger } from "../lib/logger.ts";
import {
	formatInTimeZone,
	getEndDelayMs,
	getFastingWindow,
	getReminderDelayMs,
} from "../lib/time-utils.ts";
import { FASTING_JOB_NAMES, type FastingJob } from "../queue/fasting.job.ts";
import type { Queue } from "../queue/queue.interface.ts";

const logger = createLogger("scheduleEatingWindow");

export interface ScheduleEatingWindowInput {
	userId: number;
	chatId: number;
	startAt: Date;
}

export interface ScheduleEatingWindowResult {
	windowStartISO: string;
	windowEndISO: string;
}

export async function scheduleEatingWindow(
	fastingQueue: Queue<FastingJob>,
	input: ScheduleEatingWindowInput,
): Promise<ScheduleEatingWindowResult> {
	const { userId, chatId, startAt } = input;
	const { endsAt } = getFastingWindow(
		startAt,
		FASTING_CONFIG.eatingWindowHours,
	);
	const now = new Date();

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
		"scheduled eating window",
	);

	return { windowStartISO, windowEndISO };
}

export function formatEatingWindowEnd(endsAt: Date): string {
	return formatInTimeZone(endsAt, FASTING_CONFIG.timezone);
}
