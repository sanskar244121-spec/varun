import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCTS } from "../constants";
import { ChatMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY missing");
}

const genAI = new GoogleGenerativeAI(API_KEY);

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(query);
    return result.response.text();
  } catch (err) {
    console.error(err);
    return "Network issue. Please try again.";
  }
}
