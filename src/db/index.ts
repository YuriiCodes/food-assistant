import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema  from './schema.ts'


import {ENV} from "../config/env.ts";


export const db = drizzle(ENV.DATABASE_URL!, {
    schema
});
