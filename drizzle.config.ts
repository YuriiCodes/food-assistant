import {defineConfig} from "drizzle-kit";
import {ENV} from "./src/config/env.ts";


export default defineConfig({
    dialect: "postgresql",
    schema: './src/db/schema.ts',
    out: "./drizzle",
    dbCredentials: {
        url: ENV.DATABASE_URL,
    },
});
