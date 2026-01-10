import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor". You help direct selling distributors find the right products from the YTM catalog.

KNOWLEDGE BASE:
Current Catalog Size: ${PRODUCTS.length} products.
Full Database: ${JSON.stringify(PRODUCTS)}

CORE RULES:
1. ALWAYS provide product recommendations in a BILINGUAL format (English and Hindi).
2. For EVERY product recommended, you MUST use this structure:
   - **[English Name] / [Hindi Name]**
   - **English Details:**
     * Benefits
     * Dosage
   - **हिन्दी विवरण:**
     * फायदे
     * खुराक
3. Use Hinglish tone.
4. Follow all mandatory combinations strictly.
5. Add disclaimer at the bottom.

DISCLAIMER:
"Note: Ye ek AI recommendation hai. Serious bimari ke liye doctor se sampark karein."
`;

export async function getProductRecommendation(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            ...history.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            {
              role: "user",
              parts: [{ text: query }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maafi chahta hoon, jawab nahi mil paaya."
    );
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Network error. Please try again later.";
  }
}
