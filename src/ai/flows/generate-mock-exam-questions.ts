'use server';
/**
 * @fileOverview A Genkit flow for generating mock exam questions based on user-defined criteria.
 *
 * - generateMockExamQuestions - A function that handles the generation of mock exam questions.
 * - GenerateMockExamQuestionsInput - The input type for the generateMockExamQuestions function.
 * - GenerateMockExamQuestionsOutput - The return type for the generateMockExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GenerateMockExamQuestionsInputSchema = z.object({
  exam: z.string().describe('The name of the Indian Government Exam.'),
  subject: z.string().optional().describe('The subject for the questions (optional).'),
  topic: z.string().optional().describe('The specific topic within the subject (optional).'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']).describe('The difficulty level of the questions.'),
  numberOfQuestions: z.number().int().min(1).max(100).describe('The number of questions to generate.'),
  language: z.enum(['English', 'Hindi', 'Bilingual']).describe('The language for the questions and options.'),
});
export type GenerateMockExamQuestionsInput = z.infer<typeof GenerateMockExamQuestionsInputSchema>;

// Output Schema
const QuestionOutputSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).length(4).describe('An array containing the four answer options (A, B, C, D).'),
  correctAnswerIndex: z.number().int().min(0).max(3).describe('The 0-indexed position of the correct answer within the options array.'),
  explanation: z.string().describe('A detailed explanation for the correct answer.'),
});

const GenerateMockExamQuestionsOutputSchema = z.array(QuestionOutputSchema).describe('An array of generated multiple-choice questions.');
export type GenerateMockExamQuestionsOutput = z.infer<typeof GenerateMockExamQuestionsOutputSchema>;

// Prompt definition
const generateMockExamQuestionsPrompt = ai.definePrompt({
  name: 'generateMockExamQuestionsPrompt',
  input: {schema: GenerateMockExamQuestionsInputSchema},
  output: {schema: GenerateMockExamQuestionsOutputSchema},
  prompt: `You are an expert at creating multiple-choice questions for Indian Government Exams.\nYour task is to generate {{numberOfQuestions}} unique multiple-choice questions (MCQs) in {{language}} for the "{{exam}}" exam.\n\n{{#if subject}}\nFocus on the subject: "{{subject}}".\n{{/if}}\n\n{{#if topic}}\nSpecifically, cover the topic: "{{topic}}".\n{{/if}}\n\nThe difficulty level should be "{{difficulty}}".\n\nEach question must have:\n- A 'questionText' field with the question itself.\n- An 'options' field which is an array of exactly four distinct answer choices (A, B, C, D).\n- A 'correctAnswerIndex' field, which is the 0-indexed number (0, 1, 2, or 3) corresponding to the correct answer in the 'options' array.\n- An 'explanation' field providing a detailed reason for the correct answer.\n\nEnsure the questions are relevant to the specified exam, subject, and topic.\nAvoid ambiguity in questions and options.\nGenerate the output as a JSON array of question objects, strictly following the schema.\n`,
});

// Flow definition
const generateMockExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMockExamQuestionsFlow',
    inputSchema: GenerateMockExamQuestionsInputSchema,
    outputSchema: GenerateMockExamQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateMockExamQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate questions.');
    }
    return output;
  }
);

// Wrapper function
export async function generateMockExamQuestions(input: GenerateMockExamQuestionsInput): Promise<GenerateMockExamQuestionsOutput> {
  return generateMockExamQuestionsFlow(input);
}
