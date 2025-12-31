
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor". You help direct selling distributors find the right products from the YTM catalog.

KNOWLEDGE BASE:
${JSON.stringify(PRODUCTS, null, 2)}

CORE RULES:
1. ALWAYS provide product recommendations in a BILINGUAL format (English and Hindi).
2. For EVERY product recommended, you MUST use this structure:
   - **[English Name] / [Hindi Name]**
   - **English Details:**
     * Benefits: [English Benefits]
     * Dosage: [English Dosage]
   - **हिन्दी विवरण (Hindi Details):**
     * फायदे: [Hindi Benefits from 'hindiBenefits']
     * खुराक: [Hindi Dosage from 'hindiDosage']
3. Use a friendly "Hinglish" tone for general conversation, but keep product technicalities clearly separated in both languages.
4. MANDATORY COMBINATIONS:
   - LADIES HEALTH: Lucco Tablets + Lady Fit Syrup (20 min gap).
   - NERVE POWER: Neuro Shakti Malt -> Syrup (20 min gap) -> Spray (Bedtime).
   - WEIGHT LOSS: Garcinia (Before meal) + Fitslim (After meal).
   - STONES: Stono Amrit + Thenga Powder.
   - DIGESTION: Ambrocid + LIVICID.
5. Emphasize "Khaane se pehle" (Before meal) and "Khaane ke baad" (After meal) in both languages.

FORMATTING:
- Use Markdown for bolding and lists.
- Use clear headings for English and Hindi sections.
- Add this disclaimer at the bottom: "Note: Ye ek AI recommendation hai. Serious bimari ke liye doctor se sampark karein. / यह एक एआई सिफारिश है। गंभीर बीमारी के लिए डॉक्टर से संपर्क करें।"
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

    return response.text || "Pardon, main samajh nahi paaya. Kripya dubara puchein. / क्षमा करें, मैं समझ नहीं पाया। कृपया दोबारा पूछें।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maafi chahta hoon, network me dikkat hai. Kripya manual catalog dekhein. / माफ़ी चाहता हूँ, नेटवर्क में समस्या है। कृपया मैन्युअल कैटलॉग देखें।";
  }
}
