import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface IntakeResult {
  category: string;
  tier: 'High' | 'Medium' | 'Low';
  summary: string;
  recommendedActions: string[];
  estimatedCostRange: string;
}

export async function processDiagnosticIntake(description: string): Promise<IntakeResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following legal problem in the context of the Nigerian legal system and categorize it. 
    
    Problem: ${description}
    
    Output the result in JSON format with the following fields:
    - category: (e.g., "Tenancy Issue," "Business Registration," "Debt Recovery", "Family Law", "Mergers, Acquisitions and Restructuring")
    - tier: ("High" for complex litigation, "Medium" for standard filings/disputes, "Low" for basic documentation or simple advice)
    - summary: A brief 2-sentence summary of the legal position.
    - recommendedActions: A list of 3-4 steps the user should take.
    - estimatedCostRange: A rough estimate in Naira (NGN).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          tier: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          summary: { type: Type.STRING },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedCostRange: { type: Type.STRING }
        },
        required: ["category", "tier", "summary", "recommendedActions", "estimatedCostRange"]
      }
    }
  });

  const text = response.text || '';
  return JSON.parse(text);
}
