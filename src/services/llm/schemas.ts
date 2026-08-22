import { z } from "zod";

export const FoodAnalysisZodSchema = z.object({
	description: z
		.string()
		.min(1)
		.describe(
			"A concise description of the food identified, e.g. 'Grilled chicken breast with rice and steamed broccoli'",
		),
	totalCalories: z
		.number()
		.int()
		.min(0)
		.max(10000)
		.describe("Total calories in the meal"),
	carbs: z.number().int().min(0).max(1000).describe("Carbohydrates in grams"),
	protein: z.number().int().min(0).max(500).describe("Protein in grams"),
	fats: z.number().int().min(0).max(500).describe("Fats in grams"),
});

export type FoodAnalysisResult = z.infer<typeof FoodAnalysisZodSchema>;
