export interface Job<T = unknown> {
	readonly name: string;
	readonly payload: T;
}

export interface JobOptions {
	delay?: number;
	attempts?: number;
}

export interface Queue<T = unknown> {
	add(job: Job<T>, options?: JobOptions): Promise<void>;
}
