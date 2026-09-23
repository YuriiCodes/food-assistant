import { z } from "zod";

const fastingConfigSchema = z.object({
	eatingWindowHours: z.number().positive().default(8),
	remindersBeforeEndHours: z.array(z.number().positive()).default([3, 1]),
	timezone: z.string().min(1).default("Europe/Berlin"),
});

function parseRemindersEnv(value: string | undefined): unknown {
	if (!value) return undefined;
	return value
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
		.map((part) => Number.parseFloat(part));
}

function parseWindowEnv(value: string | undefined): unknown {
	if (!value) return undefined;
	return Number.parseFloat(value);
}

type FastingConfig = z.infer<typeof fastingConfigSchema>;

export const FASTING_CONFIG: FastingConfig = fastingConfigSchema.parse({
	eatingWindowHours: parseWindowEnv(process.env.FASTING_WINDOW_HOURS),
	remindersBeforeEndHours: parseRemindersEnv(process.env.FASTING_REMINDERS),
	timezone: process.env.FASTING_TIMEZONE ?? undefined,
});
