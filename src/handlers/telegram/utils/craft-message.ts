import type { FoodAnalysisResult } from "../../../services/llm/schemas.ts";

export function craftMessage({
	carbs,
	totalCalories,
	fats,
	protein,
	description,
}: FoodAnalysisResult): string {
	return `
🍽️*${description}*:
Calories: ${totalCalories} kcal
Carbs: ${carbs}g
Protein: ${protein}g
Fats: ${fats}g
    `.trim();
}
