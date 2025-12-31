
import { GoogleGenAI } from "@google/genai";

// Initialize with direct access to process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalInsight = async (patientData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como assistente especialista em fisioterapia e ortopedia para a clínica Ortomac, analise o seguinte quadro do paciente e sugira pontos de atenção ou possíveis órteses/próteses indicadas: ${patientData}`,
      config: {
        systemInstruction: "Você é um consultor técnico sênior da Ortomac Órteses e Próteses. Seja conciso e profissional em português brasileiro.",
      }
    });
    // Use the .text property directly as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar sugestões clínicas no momento.";
  }
};
