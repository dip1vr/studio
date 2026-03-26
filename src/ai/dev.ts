import { config } from 'dotenv';
config();

import '@/ai/flows/generate-mock-exam-questions.ts';
import '@/ai/flows/offer-personalized-study-suggestions.ts';
import '@/ai/flows/provide-question-explanations.ts';