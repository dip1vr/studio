
import type { generateMockExamQuestions } from '@/ai/flows/generate-mock-exam-questions';

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'deepseek';

export type AIProviderSettings = {
  provider: AIProvider;
  apiKey: string;
};

export type ExamConfig = {
  exam: string;
  subject?: string;
  topic?: string;
  numberOfQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  language: 'English' | 'Hindi' | 'Bilingual';
  suggestion?: string;
  timeLimit?: number; // in minutes
  negativeMarking: boolean;
  negativeMarkingRatio?: number;
};

export type UserConfiguration = {
  activeProvider: AIProvider;
  apiKey?: string;
};

export type Question = Awaited<ReturnType<typeof generateMockExamQuestions>>[0];

export type UserAnswer = {
  selectedOption: number | null;
  status: 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review' | 'answered-and-marked-for-review';
};

export type TestSession = {
  id: string;
  userId?: string; // Make userId optional
  config: ExamConfig;
  questions: Question[];
  userAnswers: UserAnswer[];
  startTime: number;
  endTime?: number;
}

export type PerformanceBreakdown = {
  category: string;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalCount: number;
};

export type TestResult = {
  id: string;
  userId: string;
  config: ExamConfig;
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skipped: number;
  date: string;
  timeTaken: number; // in seconds
  performanceBreakdown?: PerformanceBreakdown[];
};
