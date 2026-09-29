import type { RedisClient } from "bun";

export type EventListener<T> = (payload: T) => void | Promise<void>;

export type Unsubscribe = () => Promise<void>;

export interface EventBus {
	publish(channel: string, payload: unknown): Promise<void>;
	subscribe<T>(
		channel: string,
		listener: EventListener<T>,
	): Promise<Unsubscribe>;
}

export function createRedisEventBus(
	publisher: RedisClient,
	subscriber: RedisClient,
): EventBus {
	return {
		async publish(channel: string, payload: unknown): Promise<void> {
			await publisher.publish(channel, JSON.stringify(payload));
		},
		async subscribe<T>(
			channel: string,
			listener: EventListener<T>,
		): Promise<Unsubscribe> {
			await subscriber.subscribe(channel, (message) => {
				let payload: unknown;
				try {
					payload = JSON.parse(message);
				} catch {
					return;
				}
				void listener(payload as T);
			});
			return () => subscriber.unsubscribe(channel);
		},
	};
}
