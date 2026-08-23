import { createBunRedisClient, type IRedisClient } from "bullmq";
import { RedisClient } from "bun";

export interface RedisConnection {
	rawClient: RedisClient;
	conn: IRedisClient;
}

export function createRedisConnection(redisUrl: string): RedisConnection {
	const rawClient = new RedisClient(redisUrl);
	return { rawClient, conn: createBunRedisClient(rawClient) };
}
