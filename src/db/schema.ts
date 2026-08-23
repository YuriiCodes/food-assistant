import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
} from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	telegramId: text("telegram_id").unique().notNull(),
	firstName: text("first_name"),
	username: text("username"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
export type User = InferSelectModel<typeof users>;
export type InsertUserModel = InferInsertModel<typeof users>;

export const meals = pgTable(
	"meals",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		rawText: text("raw_text"),
		description: text("description"),
		imageFileId: text("image_file_id"),
		totalCalories: integer("total_calories").notNull(),
		carbs: integer("carbs").notNull(),
		protein: integer("protein").notNull(),
		fats: integer("fats").notNull(),

		// Identifier of the chat message that produced this meal; used to make job retries idempotent
		messageId: integer("message_id"),

		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("meals_user_message_id_unique_idx").on(
			table.userId,
			table.messageId,
		),
		index("meals_user_created_at_idx").on(table.userId, table.createdAt),
	],
);

export type InsertMealsModel = InferInsertModel<typeof meals>;

export const usersRelations = relations(users, ({ many }) => ({
	meals: many(meals),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
	user: one(users, {
		fields: [meals.userId],
		references: [users.id],
	}),
}));
