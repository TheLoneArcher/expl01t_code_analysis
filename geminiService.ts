
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, SupportedLanguage } from "./types";

const createSystemPrompt = (language: SupportedLanguage) => `
You are a senior full-stack engineer and compiler expert specializing in ${language}. 
Analyze the provided code and return a strictly structured JSON object.

CORE RULES:
1. Analysis must be in execution order.
2. Define technical terms on first use.
3. Mermaid flowchart (graph TD) must reflect logic flow (loops, branches).
4. Do NOT use backticks inside JSON strings.
5. Use "Double Quotes" for Mermaid labels.

JSON Schema:
{
  "overall_program_summary": "One sentence summary.",
  "per_line_explanations": [{"lineNumber": number, "explanation": "Why this line exists."}],
  "keyword_glossary": [{"term": "keyword", "definition": "what is it", "relevance": "why here"}],
  "best_practices": [{"lineNumber": number, "guideline": "string"}],
  "detected_issues": [{"lineNumber": number, "severity": "low|medium|high", "description": "string"}],
  "mermaid_flowchart_code": "graph TD; ...",
  "node_to_line_mapping": [{"nodeId": "A", "lineNumbers": [number]}]
}
`;

export const analyzeCode = async (code: string, language: SupportedLanguage): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this ${language} code:\n\n${code}`,
    config: {
      systemInstruction: createSystemPrompt(language),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overall_program_summary: { type: Type.STRING },
          per_line_explanations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lineNumber: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["lineNumber", "explanation"]
            }
          },
          keyword_glossary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
                relevance: { type: Type.STRING }
              },
              required: ["term", "definition", "relevance"]
            }
          },
          best_practices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lineNumber: { type: Type.INTEGER },
                guideline: { type: Type.STRING }
              },
              required: ["lineNumber", "guideline"]
            }
          },
          detected_issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lineNumber: { type: Type.INTEGER },
                severity: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["lineNumber", "severity", "description"]
            }
          },
          mermaid_flowchart_code: { type: Type.STRING },
          node_to_line_mapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nodeId: { type: Type.STRING },
                lineNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
              },
              required: ["nodeId", "lineNumbers"]
            }
          }
        },
        required: ["overall_program_summary", "per_line_explanations", "keyword_glossary", "best_practices", "detected_issues", "mermaid_flowchart_code", "node_to_line_mapping"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const explainFurther = async (code: string, lineNumbers: number[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Deeper dive for lines ${lineNumbers.join(', ')} of this code:\n${code}`
  });
  return response.text;
};
