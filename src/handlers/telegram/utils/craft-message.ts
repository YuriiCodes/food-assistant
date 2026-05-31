import type { FoodAnalysisResult } from "../../../services/llm/schemas.ts";

export function craftMessage({
	carbs,
	totalCalories,
	fats,
	protein,
}: FoodAnalysisResult): string {
	return `
🍽️ Food Analysis Results:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
    `.trim();
}
