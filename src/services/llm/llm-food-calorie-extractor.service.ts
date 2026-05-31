import {
	generateText,
	type LanguageModel,
	Output,
	type UserModelMessage,
} from "ai";
import type {
	FoodCalorieExtractor,
	FromImageParams,
	FromTextAndImageParams,
	FromTextParams,
} from "./food-calorie-extractor.interface.ts";
import { type FoodAnalysisResult, FoodAnalysisZodSchema } from "./schemas.ts";

const FOOD_ANALYSIS_SYSTEM_PROMPT = `You are an expert nutritionist and dietitian with deep knowledge of food composition, portion sizes, and nutritional values. Your role is to analyze food descriptions or images and return accurate nutritional estimates.`;

export class LlmFoodCalorieExtractorService implements FoodCalorieExtractor {
	constructor(private readonly model: LanguageModel) {}

	private async analyze(
		content: UserModelMessage["content"],
	): Promise<FoodAnalysisResult> {
		const { output } = await generateText({
			model: this.model,
			system: FOOD_ANALYSIS_SYSTEM_PROMPT,
			output: Output.object({ schema: FoodAnalysisZodSchema }),
			messages: [{ role: "user", content }],
		});

		return output;
	}

	public fromText({
		description,
	}: FromTextParams): Promise<FoodAnalysisResult> {
		return this.analyze([
			{
				type: "text",
				text: `Analyze this food description and provide nutritional information: "${description}"`,
			},
		]);
	}

	public fromImage({
		imageBase64Url,
	}: FromImageParams): Promise<FoodAnalysisResult> {
		return this.analyze([
			{
				type: "text",
				text: `Analyze this food image and provide nutritional information.`,
			},
			{ type: "image", image: imageBase64Url },
		]);
	}

	public fromTextAndImage({
		imageBase64Url,
		description,
	}: FromTextAndImageParams): Promise<FoodAnalysisResult> {
		return this.analyze([
			{
				type: "text",
				text: `Analyze this food image and provide nutritional information: "${description}".`,
			},
			{ type: "image", image: imageBase64Url },
		]);
	}
}
