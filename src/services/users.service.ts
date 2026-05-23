import type {db} from "../db";
import {type InsertUserModel, type User, users} from "../db/schema.ts";

export class UsersService {
    constructor(private readonly  database: typeof db) {}

    async upsert(u: InsertUserModel): Promise<User> {
        const [user] = await this.database.insert(users).values(u).onConflictDoUpdate({
            target: users.telegramId,
            set: {
                firstName: u.firstName,
                username: u.username,
            }
        }).returning()

        if (!user){
            // TODO: logs
            throw new Error('Error upserting user')
        }

        return user
    }
}