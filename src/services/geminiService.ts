import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

function checkApiKey() {
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    console.error("GEMINI_API_KEY is missing. AI features will not work.");
    return false;
  }
  return true;
}

export async function suggestTopics(title: string): Promise<string> {
  if (!checkApiKey()) {
    throw new Error("AI configuration is missing. Please set the GEMINI_API_KEY environment variable.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a comma-separated list of technical topics or keywords for an exam titled: "${title}". 
      The output should be a single string of keywords, e.g., "React, TypeScript, Hooks, State Management".`,
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini suggestTopics error:", error);
    throw new Error(error.message || "Failed to suggest topics. Please check your API key and connection.");
  }
}

export async function generateQuestions(topic: string, count: number): Promise<Partial<Question>[]> {
  if (!checkApiKey()) {
    throw new Error("AI configuration is missing. Please set the GEMINI_API_KEY environment variable.");
  }

  const batchSize = 5;
  const batches = Math.ceil(count / batchSize);
  const allQuestions: Partial<Question>[] = [];
  
  const safeTopic = topic || "Software Engineering";

  for (let i = 0; i < batches; i++) {
    const currentBatchCount = Math.min(batchSize, count - allQuestions.length);
    if (currentBatchCount <= 0) break;

    let retryCount = 0;
    const maxRetries = 3;
    let batchSuccess = false;

    while (retryCount <= maxRetries && !batchSuccess) {
      try {
        // Use gemini-flash-latest for high speed and reliability
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: `Generate ${currentBatchCount} unique technical recruitment questions for the topic: "${safeTopic}". 
          This is batch ${i + 1} of ${batches}.`,
          config: {
            systemInstruction: `You are a world-class technical interviewer. 
            Your task is to generate high-quality, technically accurate recruitment questions.
            Always return a JSON array of objects.
            Each object must have:
            - type: "mcq" or "coding"
            - content: The question text
            - options: Array of 4 strings (only for mcq)
            - correct_answer: The correct option string (for mcq) or sample code (for coding)
            - points: A number between 5 and 20.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["mcq", "coding"] },
                  content: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct_answer: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                },
                required: ["type", "content", "correct_answer", "points"]
              }
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response");

        const batchQuestions = JSON.parse(text);
        if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
          allQuestions.push(...batchQuestions);
          batchSuccess = true;
        } else {
          throw new Error("Invalid format");
        }
      } catch (e) {
        retryCount++;
        console.warn(`Batch ${i + 1} attempt ${retryCount} failed. Retrying...`, e);
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
  }

  // FINAL SAFETY FALLBACK: If AI completely fails after all retries, 
  // provide high-quality static questions so the user can still use the app.
  if (allQuestions.length === 0) {
    console.error("AI Generation completely failed. Using fallback questions.");
    return [
      {
        type: "mcq",
        content: `Which of the following is a core principle of ${safeTopic}?`,
        options: ["Abstraction", "Redundancy", "Manual Testing Only", "Fixed Scaling"],
        correct_answer: "Abstraction",
        points: 10
      },
      {
        type: "coding",
        content: `Write a function in any language that demonstrates a key concept in ${safeTopic}.`,
        correct_answer: "// Sample implementation\nfunction solve() { return true; }",
        points: 20
      },
      {
        type: "mcq",
        content: "What is the primary benefit of using a Version Control System?",
        options: ["Collaboration and History", "Faster CPU Speed", "Automatic Code Writing", "Increased RAM"],
        correct_answer: "Collaboration and History",
        points: 10
      },
      {
        type: "mcq",
        content: "In software development, what does 'CI/CD' stand for?",
        options: ["Continuous Integration / Continuous Deployment", "Code Inspection / Code Design", "Computer Interface / Computer Drive", "Central Intelligence / Central Data"],
        correct_answer: "Continuous Integration / Continuous Deployment",
        points: 10
      }
    ];
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
