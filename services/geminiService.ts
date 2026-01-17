
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize GoogleGenAI using an object with the apiKey property from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateContract(projectName: string, clientName: string, value: number) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um rascunho simplificado de contrato de prestação de serviços criativos para o projeto "${projectName}" para o cliente "${clientName}" no valor de R$ ${value}. O texto deve ser profissional e em português brasileiro.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  },

  async analyzeOpportunities(profileData: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nestes dados da produtora: "${profileData}", analise o mercado atual e sugira 3 oportunidades de novos clientes ou nichos de projetos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              matchScore: { type: Type.NUMBER }
            },
            required: ["id", "title", "description", "matchScore"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  },

  async parseClientFeedback(feedbackText: string, audioData?: { data: string, mimeType: string }) {
    const parts: any[] = [];
    
    if (audioData) {
        parts.push({
            inlineData: {
                data: audioData.data,
                mimeType: audioData.mimeType
            }
        });
    }

    if (feedbackText) {
        parts.push({ text: feedbackText });
    }

    if (parts.length === 0) return { transcription: "", tasks: [] };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025', // Modelo otimizado para áudio
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: `Você é um assistente de pós-produção. 
        1. Se houver áudio, transcreva-o fielmente para o português.
        2. Analise o conteúdo (texto ou transcrição) e transforme em uma lista de tarefas técnicas para um editor de vídeo.
        3. Se o cliente for vago, infira a ação técnica necessária (ex: "tira essa parte chata" -> "Cortar trecho irrelevante").`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING, description: "A transcrição completa do áudio, se houver, ou o texto original." },
            tasks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    task: { type: Type.STRING, description: "Ação técnica a ser realizada pelo editor." }
                    },
                    required: ["task"]
                }
            }
          },
          required: ["transcription", "tasks"]
        }
      }
    });
    return JSON.parse(response.text || '{"transcription": "", "tasks": []}');
  },

  // Atualizado para aceitar array de conteudos (texto + arquivos)
  async runCustomGem(systemInstruction: string, contents: any[]) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Modelo Multimodal capaz de ler docs/imagens
      contents: { parts: contents },
      config: {
        systemInstruction: systemInstruction, 
        temperature: 0.8, 
      }
    });
    return response.text;
  }
};
