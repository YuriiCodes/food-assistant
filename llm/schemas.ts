import {z} from "zod";

export const FoodAnalysisSchema = z.object({
    total_calories: z.number().int().describe("Total calories in the meal"),
    carbs: z.number().int().describe("Carbohydrates in grams"),
    protein: z.number().int().describe("Protein in grams"),
    fats: z.number().int().describe("Fats in grams")
});
export type FoodAnalysis = z.infer<typeof FoodAnalysisSchema>