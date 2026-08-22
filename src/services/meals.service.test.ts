import { describe, expect, it } from "bun:test";
import { MealsService } from "./meals.service.ts";

type ChainConfig = {
	returning?: unknown[];
	rows?: unknown[];
};

function createChainableDb(config: ChainConfig = {}) {
	const calls: { method: string; args: unknown[] }[] = [];

	const track =
		(method: string) =>
		(...args: unknown[]) => {
			calls.push({ method, args });
			return builder;
		};

	const builder: Record<string, unknown> = {
		values: track("values"),
		onConflictDoUpdate: track("onConflictDoUpdate"),
		where: track("where"),
		from: track("from"),
		groupBy: track("groupBy"),
		select: track("select"),
		insert: track("insert"),
		delete: track("delete"),
		orderBy: () => Promise.resolve(config.rows ?? []),
		returning: async () => config.returning ?? [],
	};

	return { db: builder as never, calls };
}

describe("MealsService", () => {
	it("create persists the meal and returns the saved record", async () => {
		const meal = {
			userId: 1,
			rawText: "pizza",
			totalCalories: 800,
			carbs: 90,
			protein: 30,
			fats: 35,
		};
		const saved = {
			id: 10,
			createdAt: new Date(),
			description: null,
			imageFileId: null,
			...meal,
		};
		const { db } = createChainableDb({ returning: [saved] });
		const service = new MealsService(db);

		const result = await service.create(meal);

		expect(result).toEqual(saved);
	});

	it("create throws when nothing is returned by the database", async () => {
		const { db } = createChainableDb({ returning: [] });
		const service = new MealsService(db);

		await expect(
			service.create({
				userId: 1,
				totalCalories: 100,
				carbs: 10,
				protein: 5,
				fats: 2,
			}),
		).rejects.toThrow("Failed to persist meal");
	});

	it("delete returns true when a row was removed", async () => {
		const { db } = createChainableDb({
			returning: [{ id: 7 }],
		});
		const service = new MealsService(db);

		expect(await service.delete(7, 1)).toBe(true);
	});

	it("delete returns false when nothing was removed", async () => {
		const { db } = createChainableDb({ returning: [] });
		const service = new MealsService(db);

		expect(await service.delete(999, 1)).toBe(false);
	});

	it("aggregateNutritionalInfo coerces SQL values to numbers and sums totals", async () => {
		const perDay = [
			{
				date: "2026-08-21",
				calories: "1500",
				carbs: "120",
				protein: "80",
				fats: "50",
			},
			{
				date: "2026-08-22",
				calories: "2000",
				carbs: "200",
				protein: "100",
				fats: "70",
			},
		];
		const { db } = createChainableDb({ rows: perDay });
		const service = new MealsService(db);
		const from = new Date(2026, 7, 16);
		const to = new Date(2026, 7, 22, 23, 59, 59);

		const result = await service.aggregateNutritionalInfo(1, from, to);

		expect(result.totals).toEqual({
			calories: 3500,
			carbs: 320,
			protein: 180,
			fats: 120,
		});
		for (const day of result.perDay) {
			expect(Number.isInteger(day.calories)).toBe(true);
			expect(Number.isInteger(day.carbs)).toBe(true);
			expect(Number.isInteger(day.protein)).toBe(true);
			expect(Number.isInteger(day.fats)).toBe(true);
		}
	});

	it("aggregateNutritionalInfo returns zeroed totals for no meals", async () => {
		const { db } = createChainableDb({ rows: [] });
		const service = new MealsService(db);

		const result = await service.aggregateNutritionalInfo(
			1,
			new Date(),
			new Date(),
		);

		expect(result.perDay).toEqual([]);
		expect(result.totals).toEqual({
			calories: 0,
			carbs: 0,
			protein: 0,
			fats: 0,
		});
	});

	it("aggregateNutritionalInfo throws on invalid aggregate values", async () => {
		const { db } = createChainableDb({
			rows: [
				{
					date: "2026-08-21",
					calories: "-5",
					carbs: "10",
					protein: "5",
					fats: "1",
				},
			],
		});
		const service = new MealsService(db);

		await expect(
			service.aggregateNutritionalInfo(1, new Date(), new Date()),
		).rejects.toThrow(/invalid calories value/);
	});
});
