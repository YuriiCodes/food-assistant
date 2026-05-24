import type { NutritionAggregate } from "../types/nutrition-aggregates.type.ts";
import type { NutritionReportFormatter } from "./nutrition-report-formatter.interface.ts";

export class TextNutritionReportFormatter implements NutritionReportFormatter {
	format(aggregate: NutritionAggregate, timeframeLabel: string): string {
		const { perDay, totals } = aggregate;

		if (perDay.length === 0) {
			return `📊 *${timeframeLabel}*\n\nNo meals logged yet.`;
		}

		const dailyLines = perDay
			.map(
				(day) =>
					`📅 *${day.date}*\n` +
					`  🔥 ${day.calories} kcal\n` +
					`  🍞 Carbs: ${day.carbs}g  🥩 Protein: ${day.protein}g  🧈 Fats: ${day.fats}g`,
			)
			.join("\n\n");

		const totalsLine =
			`\n\n━━━━━━━━━━━━━━\n` +
			`📊 *Total (${timeframeLabel})*\n` +
			`  🔥 ${totals.calories} kcal\n` +
			`  🍞 Carbs: ${totals.carbs}g  🥩 Protein: ${totals.protein}g  🧈 Fats: ${totals.fats}g`;

		return dailyLines + totalsLine;
	}
}
