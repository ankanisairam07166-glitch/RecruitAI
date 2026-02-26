import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function suggestTopics(title: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest a comma-separated list of technical topics or keywords for an exam titled: "${title}". 
    The output should be a single string of keywords, e.g., "React, TypeScript, Hooks, State Management".`,
  });

  return response.text || "";
}

export async function generateQuestions(topic: string, count: number): Promise<Partial<Question>[]> {
  const batchSize = 5;
  const batches = Math.ceil(count / batchSize);
  const allQuestions: Partial<Question>[] = [];

  for (let i = 0; i < batches; i++) {
    const currentBatchCount = Math.min(batchSize, count - allQuestions.length);
    if (currentBatchCount <= 0) break;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${currentBatchCount} recruitment exam questions for the topic: ${topic}. 
      This is batch ${i + 1} of ${batches}. Ensure questions are unique and cover different aspects of the topic.
      Include a mix of MCQs and one coding challenge if appropriate for this batch.
      For MCQs, provide 4 options and the correct answer.
      For coding, provide a problem statement and a sample solution.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "mcq or coding" },
              content: { type: Type.STRING, description: "The question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Only for mcq"
              },
              correct_answer: { type: Type.STRING, description: "Correct option for mcq or sample solution for coding" },
              points: { type: Type.NUMBER }
            },
            required: ["type", "content", "points"]
          }
        }
      }
    });

    try {
      const batchQuestions = JSON.parse(response.text || "[]");
      allQuestions.push(...batchQuestions);
    } catch (e) {
      console.error(`Failed to parse Gemini response for batch ${i + 1}`, e);
      // If one batch fails, we continue to try others to get as many as possible
    }
  }

  return allQuestions;
}

export async function evaluateCodingAnswer(question: string, answer: string): Promise<{ score: number; feedback: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Evaluate this coding answer for the following question:
    Question: ${question}
    Answer: ${answer}
    
    Provide a score from 0 to 10 and brief technical feedback.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"score": 0, "feedback": "Error evaluating"}');
  } catch (e) {
    return { score: 0, feedback: "Evaluation failed" };
  }
}
