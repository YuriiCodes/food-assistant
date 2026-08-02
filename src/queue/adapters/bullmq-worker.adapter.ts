import type {
	Job as BullJob,
	WorkerOptions as BullWorkerOptions,
	IRedisClient,
} from "bullmq";
import { Worker as BullWorker } from "bullmq";
import type { Job } from "../queue.interface.ts";
import type {
	WorkerOptions as DomainWorkerOptions,
	JobHandlerMap,
	Worker,
} from "../worker.interface.ts";

export class BullMQWorkerAdapter<J extends Job<unknown>> implements Worker {
	private readonly bullWorker: BullWorker;

	constructor(
		queueName: string,
		handlers: JobHandlerMap<J>,
		connection: IRedisClient,
		options?: DomainWorkerOptions,
	) {
		this.bullWorker = new BullWorker(
			queueName,
			(bullJob: BullJob) => this.dispatch(bullJob, handlers),
			this.toBullOptions(connection, options),
		);
	}

	async close(): Promise<void> {
		await this.bullWorker.close();
	}

	private async dispatch(
		bullJob: BullJob,
		handlers: JobHandlerMap<J>,
	): Promise<void> {
		const handler = handlers[bullJob.name as J["name"]];
		if (!handler)
			throw new Error(`No handler registered for job "${bullJob.name}"`);
		const job = { name: bullJob.name, payload: bullJob.data } as J;
		await handler(job as never);
	}

	private toBullOptions(
		connection: IRedisClient,
		options?: DomainWorkerOptions,
	): BullWorkerOptions {
		return { connection, concurrency: options?.concurrency };
	}
}
