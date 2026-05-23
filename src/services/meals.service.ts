import type { db } from "../db";
import { type InsertMealsModel, meals } from "../db/schema.ts";
import { createLogger } from "../lib/logger.ts";

export class MealsService {
	private readonly logger = createLogger(this.constructor.name);

	constructor(private readonly database: typeof db) {}

	async create(meal: InsertMealsModel) {
		const [record] = await this.database.insert(meals).values(meal).returning();

		this.logger.info({ meal }, "saved meal");

		return record;
	}
}
