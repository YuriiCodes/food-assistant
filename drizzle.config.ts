// drizzle.config.ts
import {defineConfig} from "drizzle-kit";
import {ENV} from "./src/config/env.ts";

export default defineConfig({
    dialect: "turso",
    dbCredentials: {
        url: ENV.DATABASE_URL,
    },
});
