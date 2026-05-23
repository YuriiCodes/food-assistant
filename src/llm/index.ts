import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { ENV } from "../config/env.ts";
import { type FoodAnalysisResult, FoodAnalysisZodSchema } from "./schemas.ts";

const openrouter = createOpenRouter({
	apiKey: ENV.OPEN_ROUTER_API_KEY,
});

export const analyzeFoodImage = async ({
	imageUrl,
	text,
}: {
	imageUrl: string;
	text?: string;
}): Promise<FoodAnalysisResult> => {
	const { output } = await generateText({
		model: openrouter("google/gemini-2.5-pro"),
		output: Output.object({
			schema: FoodAnalysisZodSchema,
		}),
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `Analyze this food image and provide nutritional information. ${text ? `Additional context: ${text}` : ""}.`,
					},
					{
						type: "image",
						image: imageUrl,
					},
				],
			},
		],
	});

	return output;
};
