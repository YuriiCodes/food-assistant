import type {
	Job as BullJob,
	WorkerOptions as BullWorkerOptions,
	IRedisClient,
} from "bullmq";
import { Worker as BullWorker } from "bullmq";
import type { Job } from "../queue.interface.ts";
import type {
	WorkerOptions as DomainWorkerOptions,
	JobHandler,
	Worker,
} from "../worker.interface.ts";

export class BullMQWorkerAdapter<T> implements Worker {
	private readonly bullWorker: BullWorker;

	constructor(
		queueName: string,
		handler: JobHandler<T>,
		connection: IRedisClient,
		options?: DomainWorkerOptions,
	) {
		this.bullWorker = new BullWorker(
			queueName,
			(bullJob: BullJob) => handler(this.toDomainJob(bullJob)),
			this.toBullOptions(connection, options),
		);
	}

	async close(): Promise<void> {
		await this.bullWorker.close();
	}

	private toDomainJob(bullJob: BullJob): Job<T> {
		return { name: bullJob.name, payload: bullJob.data as T };
	}

	private toBullOptions(
		connection: IRedisClient,
		options?: DomainWorkerOptions,
	): BullWorkerOptions {
		return { connection, concurrency: options?.concurrency };
	}
}
