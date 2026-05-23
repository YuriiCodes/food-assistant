import { pgTable, text, integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel, relations } from 'drizzle-orm';

export const users = pgTable('users', {

    id: serial('id').primaryKey(),
    telegramId: text('telegram_id').unique().notNull(),
    firstName: text('first_name'),
    username: text('username'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type User = InferSelectModel<typeof users>;

export const meals = pgTable('meals', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    rawText: text('raw_text'),
    imageFileId: text('image_file_id'),
    totalCalories: integer('total_calories').notNull(),
    carbs: integer('carbs').notNull(),
    protein: integer('protein').notNull(),
    fats: integer('fats').notNull(),

    // Timestamp management
    createdAt: timestamp('created_at').defaultNow().notNull(),
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