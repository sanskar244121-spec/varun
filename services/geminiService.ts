
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor". You help direct selling distributors find products for their patients.
You have a catalog of EXACTLY 46 medicines and supplements.

KNOWLEDGE BASE:
${JSON.stringify(PRODUCTS, null, 2)}

SPECIFIC COMBINATION RULES (MANDATORY):
1. LADIES HEALTH: Recommend "Lucco Tablets" (Post-meal) + "Lady Fit Syrup" (Exactly 20 mins AFTER tablet).
2. BRAIN/NERVE: "Neuro Shakti Malt" -> "Neuro Shakti Syrup" (20 min gap) -> "Neuro Shakti Spray" (Sleep).
3. WEIGHT LOSS: "GARCINIA CAMBOGIA" (30 min BEFORE meal) + "Fitslim Capsules" (AFTER meal).
4. LIVER CARE: "Ambroliv Tablets" + "Ambroliv Liver Tonic".
5. STONES: "Stono Amrit Capsule" + "Thenga Powder".
6. DIGESTION: "Ambrocid Tablets" + "LIVICID Syrup".
7. ADDICTION: "NIXNIP DROP" (Can be mixed in water/food secretly).
8. BONES: "Bone Health Tablets" + "Calciambro".

GENERAL INSTRUCTIONS:
- Use Hinglish (mixture of Hindi/English).
- Use the 'hindiBenefits' and 'hindiDosage' fields from the knowledge base to provide answers in Hindi when requested or when it improves clarity.
- Always specify "Khaane se pehle" (Before meal) or "Khaane ke baad" (After meal).
- If symptoms match multiple products, suggest a "Complete Treatment Package".
- Include the disclaimer: "Note: Ye ek AI recommendation hai. Serious bimari ke liye doctor se sampark karein."

RESPOND IN MARKDOWN WITH CLEAR HEADINGS AND BOLD TEXT. ALWAYS SHOW THE NAME IN HINDI TOO.
`;

export async function getProductRecommendation(query: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "Pardon, main samajh nahi paaya. Dubara puchein.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maafi chahta hoon, AI service me dikkat hai. Kripya manual catalog check karein.";
  }
}
