import {migrate} from "drizzle-orm/bun-sql/migrator"


import {db} from "./src/db";


// @ts-ignore
migrate(db, {migrationsFolder: "./drizzle"});