import { z } from "zod";

export const FoodAnalysisZodSchema = z.object({
	totalCalories: z.number().int().describe("Total calories in the meal"),
	carbs: z.number().int().describe("Carbohydrates in grams"),
	protein: z.number().int().describe("Protein in grams"),
	fats: z.number().int().describe("Fats in grams"),
});

export type FoodAnalysisResult = z.infer<typeof FoodAnalysisZodSchema>;
