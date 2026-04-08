import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Budget } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialInsights(transactions: Transaction[], budgets: Budget[]) {
  if (transactions.length === 0) return "Add some transactions to get AI-powered insights!";

  const prompt = `
    Analyze the following financial data and provide 3-4 concise, actionable insights or suggestions.
    
    Transactions:
    ${JSON.stringify(transactions.map(t => ({ amount: t.amount, type: t.type, category: t.category, date: t.date })))}
    
    Budgets:
    ${JSON.stringify(budgets)}
    
    Focus on:
    1. Spending habits (e.g., "You spend 40% of your income on Food").
    2. Budget warnings (e.g., "You are close to exceeding your Entertainment budget").
    3. Future predictions (e.g., "Based on your trend, you might spend $X more this month").
    4. Savings suggestions.
    
    Keep the tone professional, encouraging, and brief.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial advisor AI. Provide concise, data-driven insights in bullet points.",
      },
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating insights. Please try again later.";
  }
}

export async function predictNextMonthExpenses(transactions: Transaction[]) {
  if (transactions.length < 5) return null;

  const prompt = `
    Based on the following transaction history, predict the total expenses for the next month.
    Return only a JSON object with 'predictedAmount' and 'confidence' (0-1).
    
    Data:
    ${JSON.stringify(transactions.filter(t => t.type === 'expense'))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedAmount: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER }
          },
          required: ["predictedAmount", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return null;
  }
}
