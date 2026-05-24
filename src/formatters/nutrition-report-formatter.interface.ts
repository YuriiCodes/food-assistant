import type { NutritionAggregate } from "../types/nutrition-aggregates.type.ts";

export interface NutritionReportFormatter {
	format(aggregate: NutritionAggregate, timeframeLabel: string): string;
}
