export const DELETE_MEAL_CALLBACK_PREFIX = "delete_meal:";

export const DELETE_MEAL_CALLBACK_REGEX = /^delete_meal:(\d+)$/;

export function buildDeleteMealCallbackData(mealId: number): string {
	return `${DELETE_MEAL_CALLBACK_PREFIX}${mealId}`;
}

export function parseDeleteMealCallbackData(data: string): number | undefined {
	const match = DELETE_MEAL_CALLBACK_REGEX.exec(data);
	return match ? Number(match[1]) : undefined;
}
