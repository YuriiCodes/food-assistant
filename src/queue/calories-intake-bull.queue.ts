import { Queue as BullQueue } from "bullmq";
import { redisConn } from "../cache";

import { BullMQQueueAdapter } from "./adapters/bullmq-queue.adapter.ts";
import type { CaloriesIntakePayload } from "./calories-intake.job.ts";
import type { Queue } from "./queue.interface.ts";
import { QUEUE_NAMES } from "./queue-names.constants.ts";

const caloriesIntakeBullQueue = new BullQueue<CaloriesIntakePayload>(
	QUEUE_NAMES.CALORIES_INTAKE_QUEUE,
	{ connection: redisConn },
);

export const caloriesIntakeQueue: Queue<CaloriesIntakePayload> =
	new BullMQQueueAdapter(caloriesIntakeBullQueue);
