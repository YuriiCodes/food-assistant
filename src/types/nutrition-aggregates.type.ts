import type { DailyNutrition } from "./daily-nutrition.type.ts";

export type NutritionAggregate = {
	perDay: DailyNutrition[];
	totals: Omit<DailyNutrition, "date">;
};
