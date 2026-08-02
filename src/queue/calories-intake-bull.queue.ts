import { Queue as BullQueue } from "bullmq";
import { redisConn } from "../cache";

import { BullMQQueueAdapter } from "./adapters/bullmq-queue.adapter.ts";
import type { CaloriesIntakeJob } from "./calories-intake.job.ts";
import type { Queue } from "./queue.interface.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";

const mealBullQueue = new BullQueue(QUEUE_NAMES.CALORIES_INTAKE_QUEUE, {
	connection: redisConn,
});

export const mealQueue: Queue<CaloriesIntakeJob> = new BullMQQueueAdapter(
	mealBullQueue,
);
