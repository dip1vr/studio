'use server';
/**
 * @fileOverview This file implements a Genkit flow that analyzes a user's test performance
 * and provides personalized study suggestions based on identified weak areas.
 *
 * - offerPersonalizedStudySuggestions - The main function to call for getting study tips.
 * - PersonalizedStudySuggestionsInput - The input type for the flow.
 * - PersonalizedStudySuggestionsOutput - The output type of the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedStudySuggestionsInputSchema = z.object({
  totalQuestions: z.number().describe('Total number of questions in the test.'),
  correctAnswers: z.number().describe('Number of correctly answered questions.'),
  incorrectAnswers: z.number().describe('Number of incorrectly answered questions.'),
  skippedQuestions: z.number().describe('Number of skipped questions.'),
  overallAccuracy: z.number().describe('Overall accuracy percentage for the test.'),
  performanceBreakdown: z.array(
    z.object({
      categoryType: z.enum(['subject', 'topic']).describe('Whether this breakdown is for a subject or a topic.'),
      categoryName: z.string().describe('Name of the subject or topic.'),
      correctCount: z.number().describe('Number of correct answers in this category.'),
      incorrectCount: z.number().describe('Number of incorrect answers in this category.'),
      accuracy: z.number().describe('Accuracy percentage for this category.'),
    })
  ).describe('Breakdown of performance by subjects and/or topics.').min(1, 'Performance breakdown must not be empty.'),
});
export type PersonalizedStudySuggestionsInput = z.infer<typeof PersonalizedStudySuggestionsInputSchema>;

const PersonalizedStudySuggestionsOutputSchema = z.object({
  tips: z.array(z.string()).min(3).max(5).describe('3 to 5 personalized improvement tips based on the test results.'),
});
export type PersonalizedStudySuggestionsOutput = z.infer<typeof PersonalizedStudySuggestionsOutputSchema>;

const offerPersonalizedStudySuggestionsPrompt = ai.definePrompt({
  name: 'offerPersonalizedStudySuggestionsPrompt',
  input: { schema: PersonalizedStudySuggestionsInputSchema },
  output: { schema: PersonalizedStudySuggestionsOutputSchema },
  prompt: `You are an experienced study advisor. Analyze the provided test results, identify the user's weak areas, and generate 3 to 5 actionable and personalized improvement tips. Focus on specific subjects or topics where performance was low.

Here are the test results:
Total Questions: {{{totalQuestions}}}
Correct Answers: {{{correctAnswers}}}
Incorrect Answers: {{{incorrectAnswers}}}
Skipped Questions: {{{skippedQuestions}}}
Overall Accuracy: {{{overallAccuracy}}}%

Performance Breakdown:
{{#each performanceBreakdown}}
  - Category: {{{categoryName}}} (Type: {{{categoryType}}}) - Correct: {{{correctCount}}}, Incorrect: {{{incorrectCount}}}, Accuracy: {{{accuracy}}}%
{{/each}}

Based on this data, provide 3-5 personalized study suggestions.`,
});

const offerPersonalizedStudySuggestionsFlow = ai.defineFlow(
  {
    name: 'offerPersonalizedStudySuggestionsFlow',
    inputSchema: PersonalizedStudySuggestionsInputSchema,
    outputSchema: PersonalizedStudySuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await offerPersonalizedStudySuggestionsPrompt(input);
    return output!;
  }
);

export async function offerPersonalizedStudySuggestions(
  input: PersonalizedStudySuggestionsInput
): Promise<PersonalizedStudySuggestionsOutput> {
  return offerPersonalizedStudySuggestionsFlow(input);
}
