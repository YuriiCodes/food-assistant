import { redisConn } from "./cache";
import { BullMQWorkerAdapter } from "./queue/adapters/bullmq-worker.adapter.ts";
import type { CaloriesIntakePayload } from "./queue/calories-intake.job.ts";
import type { Job } from "./queue/queue.interface.ts";
import { QUEUE_NAMES } from "./queue/queue-names.constants.ts";

async function handleCaloriesIntake(
	job: Job<CaloriesIntakePayload>,
): Promise<void> {
	console.log(job.payload.color);
}

export const caloriesIntakeWorker = new BullMQWorkerAdapter(
	QUEUE_NAMES.CALORIES_INTAKE_QUEUE,
	handleCaloriesIntake,
	redisConn,
	{ concurrency: 5 },
);
