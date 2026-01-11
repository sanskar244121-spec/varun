import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const SYSTEM_INSTRUCTION = `
You are the YTM Medicine Advisor.
Use this catalog only.
Catalog size: ${PRODUCTS.length}
Catalog data: ${JSON.stringify(PRODUCTS)}
`;

export async function getProductRecommendation(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: [
            ...history.map(h => ({
              role: h.role,
              parts: [{ text: h.content }]
            })),
            {
              role: "user",
              parts: [{ text: query }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maafi, jawab nahi mila. Dobara poochiye."
    );
  } catch (err) {
    console.error(err);
    return "Network ya API error. Thodi der baad try karein.";
  }
}
