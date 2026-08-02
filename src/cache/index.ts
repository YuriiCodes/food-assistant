import { createBunRedisClient } from "bullmq";

import { RedisClient } from "bun";
import { ENV } from "../config/env.ts";

export const rawRedisClient = new RedisClient(ENV.REDIS_URL);
export const redisConn = createBunRedisClient(rawRedisClient);
