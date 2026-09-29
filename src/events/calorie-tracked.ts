import { z } from "zod";
import type { EventBus, Unsubscribe } from "./event-bus.ts";

export interface CalorieTrackedPayload {
	userId: number;
	chatId: number;
	mealId: number;
	totalCalories: number;
	trackedAt: Date;
}

export const CALORIE_TRACKED_CHANNEL = "calorie.tracked";

export type CalorieTrackedListener = (
	payload: CalorieTrackedPayload,
) => void | Promise<void>;

const calorieTrackedWireSchema = z.object({
	userId: z.number().int(),
	chatId: z.number().int(),
	mealId: z.number().int(),
	totalCalories: z.number(),
	trackedAt: z.iso.datetime(),
});

export function publishCalorieTracked(
	bus: EventBus,
	payload: CalorieTrackedPayload,
): Promise<void> {
	return bus.publish(CALORIE_TRACKED_CHANNEL, {
		...payload,
		trackedAt: payload.trackedAt.toISOString(),
	});
}

export function subscribeCalorieTracked(
	bus: EventBus,
	listener: CalorieTrackedListener,
): Promise<Unsubscribe> {
	return bus.subscribe<unknown>(CALORIE_TRACKED_CHANNEL, (raw) => {
		const parsed = calorieTrackedWireSchema.safeParse(raw);
		if (parsed.success) {
			void listener({
				...parsed.data,
				trackedAt: new Date(parsed.data.trackedAt),
			});
		}
	});
}
