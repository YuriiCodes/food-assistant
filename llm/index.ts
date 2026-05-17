import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {generateText, Output} from "ai";
import {type FoodAnalysis, FoodAnalysisSchema} from "./schemas.ts";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});


export const analyzeFoodImage = async ({imageUrl, text}: {
    imageUrl: string, text?: string
}): Promise<FoodAnalysis> => {
    const {output} = await generateText({
        model: openrouter('google/gemini-2.5-pro'),
        output: Output.object({
            schema: FoodAnalysisSchema
        }),
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this food image and provide nutritional information. ${text ? `Additional context: ${text}` : ''}.`
                    },
                    {
                        type: 'image',
                        image: imageUrl
                    }
                ]
            }
        ],
    });

    return output

};
