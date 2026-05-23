import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "../config/env.ts";
import * as schema from "./schema.ts";

export const db = drizzle(ENV.DATABASE_URL, {
	schema,
});
