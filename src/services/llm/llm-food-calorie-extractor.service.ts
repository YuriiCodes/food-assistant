import { generateText, type LanguageModel, Output } from "ai";
import type {
	FoodCalorieExtractor,
	FromImageParams,
	FromTextAndImageParams,
	FromTextParams,
} from "./food-calorie-extractor.interface.ts";
import { type FoodAnalysisResult, FoodAnalysisZodSchema } from "./schemas.ts";

export class LlmFoodCalorieExtractorService implements FoodCalorieExtractor {
	constructor(private readonly model: LanguageModel) {}

	public async fromText({
		description,
	}: FromTextParams): Promise<FoodAnalysisResult> {
		const { output } = await generateText({
			model: this.model,
			output: Output.object({
				schema: FoodAnalysisZodSchema,
			}),
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Analyze this food description and provide nutritional information: "${description}"`,
						},
					],
				},
			],
		});

		return output;
	}

	public async fromImage({
		imageBase64Url,
	}: FromImageParams): Promise<FoodAnalysisResult> {
		const { output } = await generateText({
			model: this.model,
			output: Output.object({
				schema: FoodAnalysisZodSchema,
			}),
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Analyze this food image and provide nutritional information.`,
						},
						{
							type: "image",
							image: imageBase64Url,
						},
					],
				},
			],
		});

		return output;
	}
	public async fromTextAndImage({
		imageBase64Url,
		description,
	}: FromTextAndImageParams): Promise<FoodAnalysisResult> {
		const { output } = await generateText({
			model: this.model,
			output: Output.object({
				schema: FoodAnalysisZodSchema,
			}),
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Analyze this food image and provide nutritional information: "${description}".`,
						},
						{
							type: "image",
							image: imageBase64Url,
						},
					],
				},
			],
		});

		return output;
	}
}
