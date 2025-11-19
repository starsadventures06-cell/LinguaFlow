import { GoogleGenAI, Modality } from "@google/genai";

// Helper to get AI instance - always fresh to pick up potential key changes
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageEdit = async (
  base64Image: string, 
  prompt: string, 
  mimeType: string = 'image/png'
): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

export const searchCulturalInsights = async (query: string): Promise<{text: string, sources: Array<{uri: string, title: string}>}> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text || "No information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web) || [];

    return { text, sources };
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
};