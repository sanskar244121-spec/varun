import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY missing");
}

const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor". You help direct selling distributors find the right products from the YTM catalog.

Catalog Size: ${PRODUCTS.length}
Products: ${JSON.stringify(PRODUCTS)}
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: SYSTEM_INSTRUCTION + "\n\nUser query: " + query,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maafi chahta hoon, response nahi mila."
    );
  } catch (err) {
    console.error(err);
    return "Network error. Kripya baad me try karein.";
  }
}
