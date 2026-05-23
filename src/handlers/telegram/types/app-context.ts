import type { Context } from "grammy";
import type { User } from "../../../db/schema.ts";

export interface AppContext extends Context {
	user: User;
}
