import type { JobsOptions as BullJobOptions } from "bullmq";
import type {
	JobOptions as DomainJobOptions,
	Job,
	Queue,
} from "../queue.interface.ts";

interface BullMQQueueLike<T> {
	add(name: string, data: T, opts?: BullJobOptions): Promise<unknown>;
}

export class BullMQQueueAdapter<T> implements Queue<T> {
	constructor(private readonly bullQueue: BullMQQueueLike<T>) {}

	async add(job: Job<T>, options?: DomainJobOptions): Promise<void> {
		await this.bullQueue.add(
			job.name,
			job.payload,
			this.toBullOptions(options),
		);
	}

	private toBullOptions(options?: DomainJobOptions): BullJobOptions {
		if (!options) return {};
		return { delay: options.delay, attempts: options.attempts };
	}
}
