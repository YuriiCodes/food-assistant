import { Queue as BullQueue, type IRedisClient } from "bullmq";

import { BullMQQueueAdapter } from "./adapters/bullmq-queue.adapter.ts";
import type { CaloriesIntakeJob } from "./calories-intake.job.ts";
import type { Queue } from "./queue.interface.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";

export function createCaloriesIntakeQueue(
	connection: IRedisClient,
): Queue<CaloriesIntakeJob> {
	const mealBullQueue = new BullQueue(QUEUE_NAMES.CALORIES_INTAKE_QUEUE, {
		connection,
		defaultJobOptions: {
			attempts: 3,
			backoff: { type: "exponential", delay: 1000 },
			removeOnComplete: { age: 24 * 3600, count: 50 },
			removeOnFail: { age: 24 * 3600, count: 50 },
		},
	});

	return new BullMQQueueAdapter(mealBullQueue);
}
