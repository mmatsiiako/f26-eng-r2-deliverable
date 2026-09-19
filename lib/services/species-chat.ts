/* eslint-disable */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const PROVIDER_ERROR_RESPONSE =
  "Sorry, I'm having trouble answering right now. Please try again later.";

export async function generateResponse(message: string): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message,

        config: {
          systemInstruction: `
            You are a chatbot that specializes only in animals and species.

            You may answer questions about:
            - animal species
            - habitats
            - diets
            - conservation status
            - behavior
            - taxonomy
            - evolution
            - ecology
            - other animal and species facts

            If the user asks about something unrelated to animals or species,
            politely explain that you only answer species-related questions.

            Keep your answers helpful, clear, and concise.
          `,
        },
      });

      return response.text ?? PROVIDER_ERROR_RESPONSE;
    } catch (error) {
      console.error(`Gemini attempt ${attempt + 1} failed:`, error);

      // Wait before trying again (1 sec, 2 sec, 4 sec)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  return PROVIDER_ERROR_RESPONSE;
}
