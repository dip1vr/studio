'use server';
/**
 * @fileOverview This file provides an AI-driven flow to generate detailed explanations for mock test questions.
 * It explains why the correct answer is right and why other options are wrong, to help users understand concepts and learn from mistakes.
 *
 * - provideQuestionExplanations - A function that provides AI-generated explanations for a given question.
 * - ProvideQuestionExplanationsInput - The input type for the provideQuestionExplanations function.
 * - ProvideQuestionExplanationsOutput - The return type for the provideQuestionExplanations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideQuestionExplanationsInputSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('An array of answer options (e.g., ["Option A", "Option B", "Option C", "Option D"]).'),
  userAnswer: z.string().describe('The option selected by the user (e.g., "Option B").'),
  correctAnswer: z.string().describe('The correct answer option (e.g., "Option A").'),
});
export type ProvideQuestionExplanationsInput = z.infer<typeof ProvideQuestionExplanationsInputSchema>;

const ProvideQuestionExplanationsOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation for the question, clarifying why the correct answer is right and why other options are wrong.'),
  isCorrect: z.boolean().describe('True if the user\u0027s answer matches the correct answer, false otherwise.'),
});
export type ProvideQuestionExplanationsOutput = z.infer<typeof ProvideQuestionExplanationsOutputSchema>;

export async function provideQuestionExplanations(input: ProvideQuestionExplanationsInput): Promise<ProvideQuestionExplanationsOutput> {
  return provideQuestionExplanationsFlow(input);
}

const provideQuestionExplanationsPrompt = ai.definePrompt({
  name: 'provideQuestionExplanationsPrompt',
  input: { schema: ProvideQuestionExplanationsInputSchema },
  output: { schema: ProvideQuestionExplanationsOutputSchema },
  prompt: `You are an expert educator and exam preparation specialist.\n\nProvide a detailed explanation for the following multiple-choice question, focusing on why the correct answer is right and why the other options are incorrect.\nAlso, determine if the user's answer was correct.\n\nQuestion: {{{question}}}\n\nOptions:\n{{#each options}}- {{{this}}}\n{{/each}}\n\nUser's Answer: {{{userAnswer}}}\nCorrect Answer: {{{correctAnswer}}}\n\nYour explanation should be thorough, covering the core concepts related to the question and explaining any common misconceptions.`,
});

const provideQuestionExplanationsFlow = ai.defineFlow(
  {
    name: 'provideQuestionExplanationsFlow',
    inputSchema: ProvideQuestionExplanationsInputSchema,
    outputSchema: ProvideQuestionExplanationsOutputSchema,
  },
  async (input) => {
    const { output } = await provideQuestionExplanationsPrompt(input);

    if (!output) {
      throw new Error('Failed to generate explanation.');
    }

    const isCorrect = input.userAnswer === input.correctAnswer;

    return {
      explanation: output.explanation,
      isCorrect: isCorrect,
    };
  }
);
