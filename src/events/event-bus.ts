import { EventEmitter } from "node:events";

export interface CalorieTrackedPayload {
	userId: number;
	chatId: number;
	mealId: number;
	totalCalories: number;
	trackedAt: Date;
}

export const CALORIE_TRACKED_EVENT = "calorie.tracked" as const;

type CalorieTrackedListener = (
	payload: CalorieTrackedPayload,
) => void | Promise<void>;

class TypedEventBus {
	private readonly emitter = new EventEmitter();

	constructor() {
		this.emitter.setMaxListeners(20);
	}

	emitCalorieTracked(payload: CalorieTrackedPayload): void {
		this.emitter.emit(CALORIE_TRACKED_EVENT, payload);
	}

	onCalorieTracked(listener: CalorieTrackedListener): () => void {
		this.emitter.on(CALORIE_TRACKED_EVENT, listener);
		return () => {
			this.emitter.off(CALORIE_TRACKED_EVENT, listener);
		};
	}
}

export const eventBus = new TypedEventBus();
