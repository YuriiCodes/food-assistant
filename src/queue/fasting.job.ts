import type { Job } from "./queue.interface.ts";

export const FASTING_JOB_NAMES = {
	REMINDER: "fasting.reminder",
} as const;

export type FastingReminderKind = "before-end" | "ended";

export interface FastingReminderPayload {
	userId: number;
	chatId: number;
	windowStartISO: string;
	windowEndISO: string;
	kind: FastingReminderKind;
	hoursBeforeEnd?: number;
}

export interface FastingReminderJob extends Job<FastingReminderPayload> {
	readonly name: typeof FASTING_JOB_NAMES.REMINDER;
}

export type FastingJob = FastingReminderJob;
