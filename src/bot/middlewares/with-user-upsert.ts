import type {DirectMessageHandler} from "chat";
import {db} from "../../db/index.ts";
import {users} from "../../db/schema.ts";

export const withUserUpsert = (handler: DirectMessageHandler): DirectMessageHandler => {
    return async (thread, message, channel, context) => {
        const author = message.author;


        await db.insert(users).values({
            telegramId: author.userId,
            firstName: author.fullName,
            username: author.userName
        }).onConflictDoUpdate({
            target: users.telegramId,
            set: {
                firstName: author.fullName,
                username: author.userName
            }
        });


        return handler(thread, message, channel, context);
    };
};