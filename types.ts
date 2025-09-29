

export type Feature = 'ai-assistant' | 'summarizer' | 'test-generator' | 'study-planner' | 'research-assistant';

export type Page = 'dashboard' | 'profile';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface SummaryResult {
  summary: string;
  flashcards: Flashcard[];
}

export enum QuestionType {
  MCQ = 'MCQ',
  Essay = 'Essay',
}

export interface MCQQuestion {
  type: QuestionType.MCQ;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface EssayQuestion {
  type: QuestionType.Essay;
  question: string;
}

export type QuizQuestion = MCQQuestion | EssayQuestion;

export interface StudyDay {
  day: string;
  tasks: {
    time: string;
    subject: string;
    task: string;
  }[];
}

export interface StudyPlan {
  plan: StudyDay[];
}

export interface ResearchSource {
  title: string;
  uri: string;
}

// Type for the authenticated user
export interface User {
    name: string;
    email: string;
    major?: string;
}

// Types for dynamic profile
export interface UserFile {
    name: string;
    size: string;
    type: 'summary' | 'test';
}

export interface UserPlan {
    title: string;
    date: string;
}
