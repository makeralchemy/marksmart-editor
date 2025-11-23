import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const improveMarkdown = async (currentContent: string, instruction: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return currentContent;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Request: ${instruction}\n\nContent:\n${currentContent}`,
      config: {
        systemInstruction: "You are an expert technical editor. Output ONLY the updated Markdown. Do not add conversational filler. Preserve the original meaning but improve grammar, flow, and formatting.",
      }
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};