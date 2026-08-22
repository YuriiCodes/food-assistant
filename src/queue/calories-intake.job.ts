import type { Job } from "./queue.interface.ts";

export const CALORIES_INTAKE_JOB_NAMES = {
	TEXT: "calories-intake.text",
	IMAGE: "calories-intake.image",
} as const;

interface CaloriesIntakeJobBase {
	userId: number;
	chatId: number;
	messageId: number;
}

export interface TextCaloriesIntakePayload extends CaloriesIntakeJobBase {
	rawText: string;
}

export interface ImageCaloriesIntakePayload extends CaloriesIntakeJobBase {
	caption?: string;
	imageFileId: string;
}

export interface TextCaloriesIntakeJob extends Job<TextCaloriesIntakePayload> {
	readonly name: typeof CALORIES_INTAKE_JOB_NAMES.TEXT;
}

export interface ImageCaloriesIntakeJob
	extends Job<ImageCaloriesIntakePayload> {
	readonly name: typeof CALORIES_INTAKE_JOB_NAMES.IMAGE;
}

export type CaloriesIntakeJob = TextCaloriesIntakeJob | ImageCaloriesIntakeJob;
