
import { GoogleGenAI } from "@google/genai";
import { Lead } from "../types";

// Initialize the Gemini API client using the environment variable API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generatePersonalizedMessage(lead: Lead, context: string) {
  try {
    // Generate content using gemini-3-flash-preview for a professional message.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma mensagem curta e profissional para o WhatsApp visando vender a criação de um site para o lead abaixo.
      Lead: ${lead.name}
      Empresa: ${lead.company}
      Status Atual: ${lead.status}
      Contexto da Campanha: ${context}
      
      Diretrizes:
      - Seja amigável mas profissional.
      - Mencione como um novo site pode ajudar o negócio dele (${lead.company}).
      - Peça uma reunião de 15 minutos.
      - Use PT-BR.
      - NÃO use emojis em excesso.
      - A resposta deve ser APENAS o texto da mensagem.`,
    });
    // The text property is a getter that returns the extracted string output.
    return response.text;
  } catch (error) {
    console.error("Error generating AI message:", error);
    return `Olá ${lead.name}, notei que a ${lead.company} pode se beneficiar muito de um site moderno. Vamos conversar?`;
  }
}
