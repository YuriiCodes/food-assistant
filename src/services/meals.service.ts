import { and, between, eq, sql } from "drizzle-orm";
import type { db } from "../db";
import { type InsertMealsModel, meals } from "../db/schema.ts";
import { assert } from "../lib/assert.ts";
import { createLogger } from "../lib/logger.ts";
import type { NutritionAggregate } from "../types/nutrition-aggregates.type.ts";

const AGGREGATE_KEYS = ["calories", "carbs", "protein", "fats"] as const;

const localDate = sql<string>`DATE(${meals.createdAt} AT TIME ZONE 'UTC')`;

export class MealsService {
	private readonly logger = createLogger(this.constructor.name);

	constructor(private readonly database: typeof db) {}

	async create(meal: InsertMealsModel) {
		const [record] = await this.database
			.insert(meals)
			.values(meal)
			.onConflictDoUpdate({
				target: [meals.userId, meals.messageId],
				set: {
					messageId: sql`${meals.messageId}`,
				},
			})
			.returning();

		assert(record, "Failed to persist meal");

		this.logger.info({ meal: record }, "saved meal");

		return record;
	}

	async delete(id: number, userId: number): Promise<boolean> {
		const result = await this.database
			.delete(meals)
			.where(and(eq(meals.id, id), eq(meals.userId, userId)))
			.returning({ id: meals.id });

		return result.length > 0;
	}

	async aggregateNutritionalInfo(
		userId: number,
		from: Date,
		to: Date,
	): Promise<NutritionAggregate> {
		const perDay = await this.database
			.select({
				date: localDate.as("date"),
				calories: sql<number>`SUM(${meals.totalCalories})`.as("calories"),
				carbs: sql<number>`SUM(${meals.carbs})`.as("carbs"),
				protein: sql<number>`SUM(${meals.protein})`.as("protein"),
				fats: sql<number>`SUM(${meals.fats})`.as("fats"),
			})
			.from(meals)
			.where(and(eq(meals.userId, userId), between(meals.createdAt, from, to)))
			.groupBy(localDate)
			.orderBy(localDate);

		for (const day of perDay) {
			for (const key of AGGREGATE_KEYS) {
				const value = Number(day[key]);
				assert(
					Number.isFinite(value) && value >= 0,
					`aggregateNutritionalInfo: invalid ${key} value ${day[key]} for date ${day.date}`,
				);
				day[key] = value;
			}
		}

		const totals = perDay.reduce(
			(acc, day) => ({
				calories: acc.calories + day.calories,
				carbs: acc.carbs + day.carbs,
				protein: acc.protein + day.protein,
				fats: acc.fats + day.fats,
			}),
			{ calories: 0, carbs: 0, protein: 0, fats: 0 },
		);

		return { perDay, totals };
	}
}
