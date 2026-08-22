import { describe, expect, it } from "bun:test";
import type { NutritionAggregate } from "../types/nutrition-aggregates.type.ts";
import { TextNutritionReportFormatter } from "./text-nutrition-report-formatter.ts";

const aggregate: NutritionAggregate = {
	perDay: [
		{
			date: "2026-08-21",
			calories: 1500,
			carbs: 120,
			protein: 80,
			fats: 50,
		},
		{
			date: "2026-08-22",
			calories: 2000,
			carbs: 200,
			protein: 100,
			fats: 70,
		},
	],
	totals: { calories: 3500, carbs: 320, protein: 180, fats: 120 },
};

describe("TextNutritionReportFormatter", () => {
	const formatter = new TextNutritionReportFormatter();

	it("reports no meals when aggregate is empty", () => {
		const output = formatter.format(
			{ perDay: [], totals: { calories: 0, carbs: 0, protein: 0, fats: 0 } },
			"Today",
		);

		expect(output).toContain("*Today*");
		expect(output).toContain("No meals logged yet.");
		expect(output).not.toContain("Total");
	});

	it("renders one section per day plus totals", () => {
		const output = formatter.format(aggregate, "This week");

		for (const day of aggregate.perDay) {
			expect(output).toContain(`📅 *${day.date}*`);
			expect(output).toContain(`🔥 ${day.calories} kcal`);
			expect(output).toContain(`Carbs: ${day.carbs}g`);
			expect(output).toContain(`Protein: ${day.protein}g`);
			expect(output).toContain(`Fats: ${day.fats}g`);
		}

		expect(output).toContain(`📊 *Total (This week)*`);
		expect(output).toContain(`🔥 ${aggregate.totals.calories} kcal`);
	});

	it("preserves day order in the report", () => {
		const output = formatter.format(aggregate, "This week");
		const firstIndex = output.indexOf("2026-08-21");
		const secondIndex = output.indexOf("2026-08-22");

		expect(firstIndex).toBeGreaterThan(-1);
		expect(secondIndex).toBeGreaterThan(firstIndex);
	});
});
