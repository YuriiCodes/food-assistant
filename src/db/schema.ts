import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import {type InferSelectModel, relations, sql} from 'drizzle-orm';


export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    telegramId: text('telegram_id').unique().notNull(), // Handles 64-bit Telegram IDs
    firstName: text('first_name'),
    username: text('username'),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});
export type User = InferSelectModel<typeof users>


export const meals = sqliteTable('meals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),

    // Raw inputs from the user
    rawText: text('raw_text'),
    imageFileId: text('image_file_id'), // Telegram file_id for the photo

    // AI Generated Outputs matching FoodAnalysisSchema
    totalCalories: integer('total_calories').notNull(),
    carbs: integer('carbs').notNull(),
    protein: integer('protein').notNull(),
    fats: integer('fats').notNull(),

    // Timestamp management
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
    meals: many(meals),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
    user: one(users, {
        fields: [meals.userId],
        references: [users.id],
    }),
}));