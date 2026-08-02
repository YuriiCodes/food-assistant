import type { Job } from "./queue.interface.ts";

export type JobHandler<J extends Job<unknown>> = (job: J) => Promise<void>;

export type JobHandlerMap<J extends Job<unknown>> = {
	[K in J["name"]]: JobHandler<Extract<J, { name: K }>>;
};

export interface WorkerOptions {
	concurrency?: number;
}

export interface Worker {
	close(): Promise<void>;
}
