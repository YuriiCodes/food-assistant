import type { db } from "../db";
import { type InsertUserModel, type User, users } from "../db/schema.ts";
import { assert } from "../lib/assert.ts";

export class UsersService {
	constructor(private readonly database: typeof db) {}

	async upsert(u: InsertUserModel): Promise<User> {
		const [user] = await this.database
			.insert(users)
			.values(u)
			.onConflictDoUpdate({
				target: users.telegramId,
				set: {
					firstName: u.firstName,
					username: u.username,
				},
			})
			.returning();

		assert(user, "Error upserting user");

		return user;
	}
}
