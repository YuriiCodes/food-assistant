import type { JobsOptions as BullJobOptions } from "bullmq";
import type {
	JobOptions as DomainJobOptions,
	Job,
	Queue,
} from "../queue.interface.ts";

interface BullMQQueueLike {
	add(name: string, data: unknown, opts?: BullJobOptions): Promise<unknown>;
}

export class BullMQQueueAdapter<J extends Job<unknown>> implements Queue<J> {
	constructor(private readonly bullQueue: BullMQQueueLike) {}

	async add(job: J, options?: DomainJobOptions): Promise<void> {
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
