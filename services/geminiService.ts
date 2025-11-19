
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

// Chat functionality for the Knowledge Base
export const generateChatResponse = async (sopData: SopResponse, messages: {role: string, content: string}[]) => {
  const apiKey = process.env.API_KEY;
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  // --- LOCAL LOGIC ENGINE (Fallback / Demo Mode) ---
  // If no API Key is present, or if we want to provide instant answers based on local JSON data
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate "thinking"

    // 1. Risk Query
    if (lastMessage.includes('risk') || lastMessage.includes('hazard')) {
        const risks = sopData.inherentRisks.map(r => `• **${r.riskId} (${r.riskType})**: ${r.description}`).join('\n');
        return `Here are the inherent risks identified in this process:\n\n${risks}`;
    }

    // 2. Actors / Who Query
    if (lastMessage.includes('who') || lastMessage.includes('actor') || lastMessage.includes('role')) {
        const actors = new Set<string>();
        sopData.processFlow.stages.forEach(s => s.steps.forEach(st => actors.add(st.actor)));
        return `The following actors are involved in this process:\n\n${Array.from(actors).map(a => `• **${a}**`).join('\n')}`;
    }

    // 3. Objective / Goal Query
    if (lastMessage.includes('objective') || lastMessage.includes('goal') || lastMessage.includes('aim')) {
        const objs = sopData.processObjectives.map(o => `• ${o.description}`).join('\n');
        return `The key objectives for this process are:\n\n${objs}`;
    }

    // 4. Summary / Steps Query
    if (lastMessage.includes('step') || lastMessage.includes('stage') || lastMessage.includes('summary')) {
        const stages = sopData.processFlow.stages.map(s => `**${s.stageName}** (${s.steps.length} steps)`).join(' → ');
        return `This process consists of ${sopData.processFlow.stages.length} stages:\n\n${stages}`;
    }

    // Default Fallback
    return `I am analyzing the **${sopData.processDefinition.title}**. \n\nYou can ask me about:\n• **Risks** involved\n• **Actors** and roles\n• **Objectives** of the process\n• Specific **Steps** in the flow`;
  }

  // --- REAL API MODE ---
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Limit context history to last 10 messages to avoid token limits
    const history = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Contextual Prompt
    const contextPrompt = `
      You are an intelligent SOP Assistant. 
      You have access to the following Business Process Data (SOP):
      ${JSON.stringify(sopData)}

      User Question: "${messages[messages.length - 1].content}"

      Answer the user's question strictly based on the provided SOP JSON data. 
      If they ask about risks, list specific risk IDs and descriptions. 
      If they ask about steps, mention the actors and automation levels.
      Format your response with bold text (using **text**) for key terms.
      Keep answers concise and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Gen Error", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
