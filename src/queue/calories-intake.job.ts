import type { Job } from "./queue.interface.ts";

export interface CaloriesIntakePayload {
	color: string;
}

export class CaloriesIntakeJob implements Job<CaloriesIntakePayload> {
	readonly name = "calories-intake";
	constructor(readonly payload: CaloriesIntakePayload) {}
}
