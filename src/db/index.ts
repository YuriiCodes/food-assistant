import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

export function createDatabase(databaseUrl: string) {
	return drizzle(databaseUrl, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
