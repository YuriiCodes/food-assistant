export interface Job<T = unknown> {
	readonly name: string;
	readonly payload: T;
}

export interface JobOptions {
	delay?: number;
	attempts?: number;
}

export interface Queue<J extends Job<unknown> = Job<unknown>> {
	add(job: J, options?: JobOptions): Promise<void>;
}
