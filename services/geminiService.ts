import { GoogleGenAI, Part, Type } from "@google/genai";
import { SummaryResult, QuizQuestion, StudyPlan, ResearchSource, QuestionType, ChatMessage } from '../types';

// ====================================================================================
// WARNING: INSECURE FOR PRODUCTION
// ====================================================================================
// Storing an API key in client-side code is a major security risk.
// Anyone can view this key and use it, which could lead to unexpected charges.
// This is for local development and demonstration purposes ONLY.
// For a real-world application, all API calls should be made from a secure backend server
// where the API key can be kept secret.
const API_KEY = 'AIzaSyBfJCdsoJilTzrTnpciRxjEHnkrRaLr-6Y';
// ====================================================================================

const ai = new GoogleGenAI({ apiKey: API_KEY });
const generativeModel = 'gemini-2.5-flash';


const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
}


// --- Academic AI Assistant ---
export const getChatResponse = async (history: ChatMessage[], message: string, file?: File): Promise<string> => {
    const systemInstruction = 'You are a friendly and knowledgeable academic assistant for university students named StudyMate. When asked who you are or who programmed you, you must answer: "انا المساعد الذكي وتم برمجتي بواسطة its5aid". Explain concepts clearly and concisely in Arabic.';
    
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const userParts: Part[] = [{ text: message }];
    if (file) {
        const filePart = await fileToGenerativePart(file);
        userParts.push(filePart);
    }
    
    contents.push({ role: 'user', parts: userParts });

    const response = await ai.models.generateContent({
        model: generativeModel,
        contents,
        config: { systemInstruction },
    });
    
    return response.text;
};


// --- Summarizer ---
export const generateSummaryAndFlashcards = async (file: File): Promise<SummaryResult> => {
    const filePart = await fileToGenerativePart(file);
    const prompt = `Please analyze the content of this file and generate a comprehensive summary and a set of flashcards (question and answer format). Provide the output in a clean JSON format. The JSON object should have two keys: "summary" (string) and "flashcards" (an array of objects, each with "question" and "answer" keys). Focus on key concepts and definitions. The response language should be Arabic.`;
    
    const response = await ai.models.generateContent({
        model: generativeModel,
        contents: { parts: [filePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    flashcards: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            },
                            required: ["question", "answer"]
                        }
                    }
                },
                required: ["summary", "flashcards"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- Test Generator ---
export const generateTest = async (file: File): Promise<QuizQuestion[]> => {
    const filePart = await fileToGenerativePart(file);
    const prompt = `Based on the content of this file, generate a practice test with a mix of Multiple Choice Questions (MCQ) and Essay questions. Provide the output in a clean JSON array format. The language of questions must be Arabic.
    For each MCQ, the object should have "type" as "MCQ", "question", "options" (an array of 4 strings), and "correctAnswer" (a string).
    For each Essay question, the object should have "type" as "Essay" and "question".
    Generate at least 5 questions in total.`;

    const response = await ai.models.generateContent({
        model: generativeModel,
        contents: { parts: [filePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.Essay] },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["type", "question"]
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- Study Planner ---
export const generateStudyPlan = async (subjects: string, time: string): Promise<StudyPlan> => {
    const prompt = `Create a weekly study plan for a university student.
    Subjects: ${subjects}
    Available Time: ${time}
    Organize the plan by day. The output must be in a clean JSON format. The root object should have a key "plan" which is an array of objects. Each object should represent a day and have a "day" (string) and "tasks" (an array of objects, each with "time", "subject", and "task" keys).
    Make the plan realistic and include breaks. The language of the plan should be Arabic.`;

    const response = await ai.models.generateContent({
        model: generativeModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING },
                                tasks: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            time: { type: Type.STRING },
                                            subject: { type: Type.STRING },
                                            task: { type: Type.STRING }
                                        },
                                        required: ["time", "subject", "task"]
                                    }
                                }
                            },
                            required: ["day", "tasks"]
                        }
                    }
                },
                required: ["plan"]
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};


// --- Research Assistant ---
export const getResearchSources = async (topic: string): Promise<{ text: string, sources: ResearchSource[] }> => {
    const prompt = `Provide a brief summary and find reliable academic sources for the following topic: "${topic}". The language of the summary should be Arabic.`;

    const response = await ai.models.generateContent({
        model: generativeModel,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: ResearchSource[] = groundingChunks
        .map((chunk: any) => ({
            title: chunk.web?.title || 'Untitled',
            uri: chunk.web?.uri || '',
        }))
        .filter((source: ResearchSource) => source.uri);

    return { text, sources };
};
