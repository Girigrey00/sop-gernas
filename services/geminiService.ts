import { GoogleGenAI } from "@google/genai";
import { SopResponse } from '../types';

// We use a simpler schema prompting approach since the JSON is very large and complex to strictly type via SDK Schema objects sometimes.
// We will instruct the model to output specific JSON.

const SYSTEM_INSTRUCTION = `
You are an expert Business Process Management (BPM) engineer and Enterprise Architect.
Your goal is to generate detailed Standard Operating Procedures (SOP) flows in a specific JSON format.

Structure Rules:
1. You must return a JSON object matching the SopResponse interface.
2. The JSON must include 'startNode', 'endNode', 'processDefinition', 'inherentRisks', and 'processFlow'.
3. 'processFlow' must contain 'stages', which contain 'steps'.
4. Each step MUST have a unique 'stepId'.
5. 'nextStep' should point to the 'stepId' of the following step.
6. If a step is a 'Decision', it must have 'decisionBranches' array with 'condition' and 'nextStep'.
7. Ensure the flow is logical and connected from START to END.

Output JSON ONLY. No markdown code blocks.
`;

export const generateSopFlow = async (prompt: string): Promise<SopResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it using the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate an Enterprise SOP Flow for the following request: "${prompt}". 
      Ensure it covers multiple stages (e.g., Initiation, Processing, Approval, Completion).
      Include relevant Risks and Controls.`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const data = JSON.parse(text);
    return data as SopResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
