import type { Job } from "./queue.interface.ts";

export type JobHandler<T> = (job: Job<T>) => Promise<void>;

export interface WorkerOptions {
	concurrency?: number;
}

export interface Worker {
	close(): Promise<void>;
}
