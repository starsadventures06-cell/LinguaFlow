import { GoogleGenAI } from "@google/genai";

export const generateImmersionVideo = async (
  base64Image: string, 
  mimeType: string,
  prompt: string = "Animate this scene naturally"
): Promise<string> => {
  
  // Veo requires user-selected key. We assume the UI has checked this.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
        throw new Error("Video generation failed to produce a URI.");
    }

    // Append API key to download
    const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    return videoUrl;

  } catch (error) {
    console.error("Veo generation error:", error);
    throw error;
  }
};