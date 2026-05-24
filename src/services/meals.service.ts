import { and, between, eq, sql } from "drizzle-orm";
import type { db } from "../db";
import { type InsertMealsModel, meals } from "../db/schema.ts";
import { createLogger } from "../lib/logger.ts";
import type { NutritionAggregate } from "../types/nutrition-aggregates.type.ts";

export class MealsService {
	private readonly logger = createLogger(this.constructor.name);

	constructor(private readonly database: typeof db) {}

	async create(meal: InsertMealsModel) {
		const [record] = await this.database.insert(meals).values(meal).returning();

		this.logger.info({ meal }, "saved meal");

		return record;
	}

	async aggregateNutritionalInfo(
		userId: number,
		from: Date,
		to: Date,
	): Promise<NutritionAggregate> {
		const perDay = await this.database
			.select({
				date: sql<string>`DATE(${meals.createdAt})`.as("date"),
				calories: sql<number>`SUM(${meals.totalCalories})`.as("calories"),
				carbs: sql<number>`SUM(${meals.carbs})`.as("carbs"),
				protein: sql<number>`SUM(${meals.protein})`.as("protein"),
				fats: sql<number>`SUM(${meals.fats})`.as("fats"),
			})
			.from(meals)
			.where(and(eq(meals.userId, userId), between(meals.createdAt, from, to)))
			.groupBy(sql`DATE(${meals.createdAt})`)
			.orderBy(sql`DATE(${meals.createdAt})`);

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
