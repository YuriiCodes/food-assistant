import type { Api } from "grammy";
import type { CalorieTrackedPayload } from "../events/calorie-tracked.ts";
import { subscribeCalorieTracked } from "../events/calorie-tracked.ts";
import type { EventBus, Unsubscribe } from "../events/event-bus.ts";
import { createLogger } from "../lib/logger.ts";
import { getDailyRange } from "../lib/time.ts";
import type { FastingJob } from "../queue/fasting.job.ts";
import type { Queue } from "../queue/queue.interface.ts";
import {
	formatEatingWindowEnd,
	scheduleEatingWindow,
} from "../services/fasting-scheduler.service.ts";
import type { MealsService } from "../services/meals.service.ts";
import type { UserSettingsService } from "../services/user-settings.service.ts";

const logger = createLogger("fastingAutoStart");

export interface FastingAutoStartDeps {
	api: Api;
	mealsService: MealsService;
	userSettingsService: UserSettingsService;
	fastingQueue: Queue<FastingJob>;
	eventBus: EventBus;
}

export function subscribeFastingAutoStart(
	deps: FastingAutoStartDeps,
): Promise<Unsubscribe> {
	const { api, mealsService, userSettingsService, fastingQueue, eventBus } =
		deps;

	return subscribeCalorieTracked(
		eventBus,
		async (payload: CalorieTrackedPayload) => {
			const { userId, chatId, trackedAt } = payload;

			try {
				const settings = await userSettingsService.getOrCreate(userId);
				if (!settings.autoStartEatingWindow) return;

				const { from, to } = getDailyRange();
				const mealsToday = await mealsService.countInRange(userId, from, to);

				if (mealsToday !== 1) {
					logger.info(
						{ userId, mealsToday },
						"skipping auto-start: not first track of day",
					);
					return;
				}

				const { windowEndISO } = await scheduleEatingWindow(fastingQueue, {
					userId,
					chatId,
					startAt: trackedAt,
				});

				await api.sendMessage(
					chatId,
					`Auto-started your 8-hour eating window based on your settings. Your last food intake should be by ${formatEatingWindowEnd(new Date(windowEndISO))}.`,
				);

				logger.info(
					{ userId, chatId, windowEndISO },
					"auto-started eating window on first track of day",
				);
			} catch (err) {
				logger.error(
					{ err, userId, chatId },
					"failed to auto-start eating window",
				);
			}
		},
	);
}
