import { z } from "zod";

const fastingConfigSchema = z.object({
	eatingWindowHours: z.number().positive(),
	remindersBeforeEndHours: z.array(z.number().positive()),
	timezone: z.string().min(1),
});

type FastingConfig = z.infer<typeof fastingConfigSchema>;

export const FASTING_CONFIG: FastingConfig = fastingConfigSchema.parse({
	eatingWindowHours: 8,
	remindersBeforeEndHours: [3, 1],
	timezone: "Europe/Berlin",
});
