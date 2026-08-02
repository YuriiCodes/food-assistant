import { z } from "zod";

export const FoodAnalysisZodSchema = z.object({
	description: z
		.string()
		.describe(
			"A concise description of the food identified, e.g. 'Grilled chicken breast with rice and steamed broccoli'",
		),
	totalCalories: z.number().int().describe("Total calories in the meal"),
	carbs: z.number().int().describe("Carbohydrates in grams"),
	protein: z.number().int().describe("Protein in grams"),
	fats: z.number().int().describe("Fats in grams"),
});

export type FoodAnalysisResult = z.infer<typeof FoodAnalysisZodSchema>;
