import { Queue as BullQueue, type IRedisClient } from "bullmq";

import { BullMQQueueAdapter } from "./adapters/bullmq-queue.adapter.ts";
import type { FastingJob } from "./fasting.job.ts";
import type { Queue } from "./queue.interface.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";

export function createFastingQueue(
	connection: IRedisClient,
): Queue<FastingJob> {
	const fastingBullQueue = new BullQueue(QUEUE_NAMES.FASTING_QUEUE, {
		connection,
		defaultJobOptions: {
			attempts: 3,
			backoff: { type: "exponential", delay: 1000 },
			removeOnComplete: { age: 48 * 3600, count: 100 },
			removeOnFail: { age: 48 * 3600, count: 100 },
		},
	});

	return new BullMQQueueAdapter(fastingBullQueue);
}
