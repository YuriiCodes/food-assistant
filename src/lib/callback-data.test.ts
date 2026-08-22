import { describe, expect, it } from "bun:test";
import {
	buildDeleteMealCallbackData,
	parseDeleteMealCallbackData,
} from "./callback-data.ts";

describe("buildDeleteMealCallbackData", () => {
	it("builds callback data with prefix", () => {
		expect(buildDeleteMealCallbackData(42)).toBe("delete_meal:42");
	});

	it("handles zero", () => {
		expect(buildDeleteMealCallbackData(0)).toBe("delete_meal:0");
	});
});

describe("parseDeleteMealCallbackData", () => {
	it("parses valid callback data", () => {
		expect(parseDeleteMealCallbackData("delete_meal:42")).toBe(42);
	});

	it("round-trips through the builder", () => {
		const mealId = 123;
		expect(
			parseDeleteMealCallbackData(buildDeleteMealCallbackData(mealId)),
		).toBe(mealId);
	});

	it("returns null for malformed data", () => {
		const invalid = [
			"delete_meal:",
			"delete_meal:abc",
			"delete_meal:1x2",
			"delete_meal:-1",
			":42",
			"",
			"something_else:42",
			"prefix_delete_meal:42",
		];
		for (const data of invalid) {
			expect(parseDeleteMealCallbackData(data)).toBeNull();
		}
	});
});
