import type { FoodAnalysisResult } from "./schemas.ts";

export type FromTextParams = { description: string };
export type FromImageParams = { imageBase64Url: string };
export type FromTextAndImageParams = FromTextParams & FromImageParams;

export interface FoodCalorieExtractor {
	fromText: (params: FromTextParams) => Promise<FoodAnalysisResult>;
	fromImage: (params: FromImageParams) => Promise<FoodAnalysisResult>;
	fromTextAndImage: (
		params: FromTextAndImageParams,
	) => Promise<FoodAnalysisResult>;
}
