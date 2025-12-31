import { GoogleGenAI } from "@google/genai";

// Always use the process.env.API_KEY directly for client initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalInsight = async (patientData: string): Promise<string> => {
  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning tasks like clinical analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Como assistente especialista em fisioterapia e ortopedia para a clínica Ortomac, analise o seguinte quadro do paciente e sugira pontos de atenção ou possíveis órteses/próteses indicadas: ${patientData}`,
      config: {
        systemInstruction: "Você é um consultor técnico sênior da Ortomac Órteses e Próteses. Seja conciso e profissional em português brasileiro.",
      }
    });
    // Correctly extract the text content from the GenerateContentResponse object property
    return response.text || "A IA não retornou uma análise clara para este caso.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar sugestões clínicas no momento devido a um erro de conexão.";
  }
};