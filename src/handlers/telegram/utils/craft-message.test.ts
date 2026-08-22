import { describe, expect, it } from "bun:test";
import { craftMessage } from "./craft-message.ts";

describe("craftMessage", () => {
	it("renders macros without leading/trailing whitespace", () => {
		const output = craftMessage({
			description: "Margherita pizza",
			totalCalories: 520,
			carbs: 60,
			protein: 25,
			fats: 18,
		});

		expect(output).toBe(
			[
				"🍽️ Food Analysis Results:",
				"Calories: 520 kcal",
				"Carbs: 60g",
				"Protein: 25g",
				"Fats: 18g",
			].join("\n"),
		);
	});

	it("handles zero values", () => {
		const output = craftMessage({
			description: "",
			totalCalories: 0,
			carbs: 0,
			protein: 0,
			fats: 0,
		});

		expect(output).toContain("Calories: 0 kcal");
	});
});
