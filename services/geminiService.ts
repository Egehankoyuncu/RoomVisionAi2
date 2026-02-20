import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from "../constants";
import { stripBase64Prefix, getMimeTypeFromDataUrl } from "../utils/imageUtils";
import { RoomDimensions } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
})

export const estimateRoomDimensions = async (roomImageBase64: string): Promise<RoomDimensions> => {
  try {
    const cleanRoomData = stripBase64Prefix(roomImageBase64);
    const roomMimeType = getMimeTypeFromDataUrl(roomImageBase64);

    const prompt = `
      Analyze this room image and estimate its dimensions (Length, Width, Height).
      Assume standard ceiling heights (e.g., 8-10ft) if not obvious.
      Look for visual cues like door frames, windows, and furniture sizes to estimate the floor area.
      
      Return the result in JSON format with keys: length, width, height, unit.
      Use 'ft' as the default unit.
      Example: { "length": "12", "width": "10", "height": "9", "unit": "ft" }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", // Use flash for faster analysis
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: roomMimeType,
              data: cleanRoomData,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            length: { type: Type.STRING },
            width: { type: Type.STRING },
            height: { type: Type.STRING },
            unit: { type: Type.STRING, enum: ["ft", "m"] },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RoomDimensions;
  } catch (error) {
    console.error("Error estimating dimensions:", error);
    // Return default fallback if AI fails
    return { length: "12", width: "12", height: "9", unit: "ft" };
  }
};

export const generateRoomPlacement = async (
  roomImageBase64: string,
  furnitureImageBase64: string,
  userInstruction: string = "",
  dimensions?: RoomDimensions
): Promise<string> => {
  try {
    const cleanRoomData = stripBase64Prefix(roomImageBase64);
    const roomMimeType = getMimeTypeFromDataUrl(roomImageBase64);
    
    const cleanFurnitureData = stripBase64Prefix(furnitureImageBase64);
    const furnitureMimeType = getMimeTypeFromDataUrl(furnitureImageBase64);

    const dimensionContext = dimensions 
      ? `Room Dimensions: ${dimensions.length}x${dimensions.width}x${dimensions.height} ${dimensions.unit}. Use these dimensions to ensure the object is scaled perfectly relative to the room volume.`
      : '';

    const prompt = `
      You are an expert interior design AI specialized in photorealistic image editing.
      
      The first image provided is the ROOM.
      The second image provided is the FURNITURE OBJECT.
      
      Task:
      Generate a realistic output image where the furniture object (Image 2) is placed naturally inside the room (Image 1).
      
      Strict Requirements:
      1. Perspective: The object must be aligned with the floor plane and perspective lines of the room.
      2. Scale: Estimate the depth of the room and scale the object appropriately so it looks realistic. ${dimensionContext}
      3. Lighting & Shadows: Analyze the light direction in the room. Generate realistic cast shadows and contact shadows for the object. Match the color temperature.
      4. Object Fidelity: Do NOT change the design, color, or texture of the furniture object. Use the provided object exactly. Isolate it from its background if necessary.
      5. Room Fidelity: Do NOT change the walls, existing furniture, or structure of the room. Only insert the new object.
      6. Output Quality: High resolution, photorealistic, no artifacts.
      
      ${userInstruction ? `Additional User Instruction: ${userInstruction}` : ''}
      
      Return only the generated image.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          // Order matters: Provide images first for context, then the instruction.
          {
            inlineData: {
              mimeType: roomMimeType,
              data: cleanRoomData,
            },
          },
          {
            inlineData: {
              mimeType: furnitureMimeType,
              data: cleanFurnitureData,
            },
          },
          { text: prompt },
        ],
      },
    });

    // Check for image in response parts
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct data URL
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated by the model. The model may have returned text instead of an image.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};