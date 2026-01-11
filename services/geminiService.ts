import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY missing");
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "YTM Medicine Advisor".
You help distributors choose correct YTM products.

Catalog size: ${PRODUCTS.length}
Catalog data: ${JSON.stringify(PRODUCTS)}
`;

export async function getProductRecommendation(
  query: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const model = genAI.models.get({
  model: "gemini-1.5-flash"
});
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

   const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ]
});

const text = result.text;
