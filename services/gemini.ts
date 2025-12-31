import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getClinicalInsight = async (patientData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como assistente especialista em fisioterapia e ortopedia para a clínica Ortomac, analise o seguinte quadro do paciente e sugira pontos de atenção ou possíveis órteses/próteses indicadas: ${patientData}`,
      config: {
        systemInstruction: "Você é um consultor técnico sênior da Ortomac Órteses e Próteses. Seja conciso e profissional em português brasileiro.",
      }
    });
    return response.text || "A IA não retornou uma análise clara para este caso.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar sugestões clínicas no momento devido a um erro de conexão.";
  }
};