import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

/**
 * IMPORTANT:
 * - Vite uses import.meta.env
 * - Variable MUST start with VITE_
 * - This key will be set in Vercel Environment Variables
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Safety check – app should not silently fail
 */
if (!API_KEY) {
  throw new Error("❌ Gemini API key missing. Set VITE_GEMINI_API_KEY in env.");
}

/**
 * SYSTEM INSTRUCTION
 * Kept optimized to avoid token overflow & blank responses
 */
const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor".
You help direct selling distributors recommend correct YTM products.

CATALOG INFO:
- Total products available: ${PRODUCTS.length}

RULES (MANDATORY):
1. Respond in BILINGUAL format (English + Hindi).
2. For every product mentioned, follow this structure:

- **[English Name] / [Hindi Name]**
  - English Details:
    • Benefits
    • Dosage
  - हिन्दी विवरण:
    • फायदे
    • खुराक

3. Use friendly Hinglish tone.
4. Recommend only from YTM catalog.
5. Mention correct BEFORE MEAL / AFTER MEAL timing clearly.
6. If user asks for disease cure → suggest products, NOT medical claims.

END WITH DISCLAIMER:
"Note: Ye ek AI recommendation hai. Serious bimari ke liye doctor se sampark karein."
`;

/**
 * MAIN FUNCTION
 */
export async function getProductRecommendation(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        ...history.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = response.text;

    if (!text || text.trim().length === 0) {
      return "Maafi chahta hoon, mujhe sahi jawab nahi mila. Kripya thoda detail me poochhein 🙏";
    }

    return text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return (
      "Network ya server me dikkat aa rahi hai.\n" +
      "Kripya thodi der baad try karein 🙏"
    );
  }
}
