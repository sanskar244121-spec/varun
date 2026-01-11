// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

// Vercel me .env file se API key fetch
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY missing. Add it in your .env file at project root.");
}

// Initialize Google GenAI client
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// System instruction for AI
const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor".
You help direct selling distributors select the right products from the YTM catalog.

KNOWLEDGE BASE:
Catalog size: ${PRODUCTS.length} products
Catalog data: ${JSON.stringify(PRODUCTS)}

CORE RULES:
1. Always reply in bilingual format (English + Hindi).
2. Provide product recommendations with full details:
   - **[English Name] / [Hindi Name]**
   - English: Benefits & Dosage
   - हिंदी: फायदे & खुराक
3. Use friendly Hinglish tone for conversation.
4. Include special combos and instructions as per catalog.

DISCLAIMER:
"Note: Ye ek AI recommendation hai. Serious bimari ke liye doctor se sampark karein. / यह एक एआई सिफारिश है। गंभीर बीमारी के लिए डॉक्टर से संपर्क करें।"
`;

/**
 * Get AI recommendation for a query
 * @param query User's question
 * @param history Chat history for context
 * @returns Recommended response text
 */
export async function getProductRecommendation(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    // Get Gemini AI model
    const model = genAI.models.get({ model: "gemini-1.5-flash" });

    // Start a chat with system instructions
    const chat = model.startChat({
      systemInstruction: SYSTEM_INSTRUCTION,
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    // Send user query
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
    });

    return result.text || "Maaf kijiye, samajh nahi paaya. / क्षमा करें, समझ नहीं पाया।";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Network error ya API issue. Kripya manual catalog dekhein. / नेटवर्क या एपीआई समस्या, कृपया मैन्युअल कैटलॉग देखें।";
  }
}
