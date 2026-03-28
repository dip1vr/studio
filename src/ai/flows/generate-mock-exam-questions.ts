
'use server';
/**
 * @fileOverview A Genkit flow for generating mock exam questions based on user-defined criteria.
 *
 * - generateMockExamQuestions - A function that handles the generation of mock exam questions.
 * - GenerateMockExamQuestionsInput - The input type for the generateMockExamQuestions function.
 * - GenerateMockExamQuestionsOutput - The return type for the generateMockExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {genkit} from 'genkit';
import {z} from 'genkit';

// Input Schema
const GenerateMockExamQuestionsInputSchema = z.object({
  exam: z.string().describe('The name of the Indian Government Exam.'),
  subject: z.string().optional().describe('The subject for the questions (optional).'),
  topic: z.string().optional().describe('The specific topic within the subject (optional).'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']).describe('The difficulty level of the questions.'),
  numberOfQuestions: z.number().int().min(1).max(100).describe('The number of questions to generate.'),
  language: z.enum(['English', 'Hindi', 'Bilingual']).describe('The language for the questions and options.'),
  suggestion: z.string().optional().describe('Specific instructions from the user to guide the AI.'),
  apiKey: z.string().optional().describe('Optional API key to use for this request.'),
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

// Prompt template string
const promptTemplate = `You are an expert at creating multiple-choice questions for Indian Government Exams. Your primary goal is accuracy and factual correctness.

Your task is to generate {{numberOfQuestions}} unique multiple-choice questions (MCQs) in {{language}} for the "{{exam}}" exam.

The difficulty level should be "{{difficulty}}".

{{#if subject}}
Focus on the subject: "{{subject}}".
{{/if}}
{{#if topic}}
Specifically, cover the topic: "{{topic}}".
{{/if}}

{{#if suggestion}}
**USER SUGGESTION:** The user has provided the following specific instructions. Adhere to them carefully: "{{suggestion}}"
{{/if}}

**VERY IMPORTANT INSTRUCTIONS FOR ACCURACY:**

1.  **Chain of Thought Process:** Before creating the options, first, think step-by-step to formulate the question text and determine the single, unambiguously correct answer and a detailed explanation. Only after this internal verification should you create the multiple-choice options. Ensure one option is 100% correct and the others are plausible but incorrect distractors.

2.  **Subject-Specific Rules:**
    {{#if subject}}
    When the subject is "Quantitative Aptitude" or "Mathematics":
    - **CRITICAL FOR RENDERING:** Wrap all mathematical formulas and expressions in single dollar signs for inline math (e.g., $x^2 + y^2 = r^2$) and double dollar signs for block-level math. For example: $$ \\frac{a}{b} $$. This is absolutely essential for the formulas to display correctly.
    - Solve the question yourself step-by-step to ensure the correct answer is generated accurately before creating the options.

    When the subject is "English Language & Comprehension" or "English":
    - Strictly adhere to established grammar rules, like those found in Wren & Martin. Avoid using ambiguous synonyms or idioms in a way that could have multiple interpretations.

    When the subject is "General Intelligence & Reasoning" or "Reasoning":
    - Double-check the logic of any patterns (e.g., in number or letter series). The logic must be consistent and not open to interpretation. Verify your own logic before finalizing the question.
    {{/if}}

Your final output **MUST** be a JSON array of question objects. Each object must have:
- 'questionText': The question itself. Ensure all math expressions are wrapped in dollar signs ($...$ or $$...$$).
- 'options': An array of exactly four distinct answer choices.
- 'correctAnswerIndex': The 0-indexed number (0, 1, 2, or 3) corresponding to the correct answer in the 'options' array.
- 'explanation': Provide a detailed, step-by-step explanation in simple, easy-to-understand language. First, explain the conventional method. Then, if a faster method exists, add a section titled "**Short Trick:**" and explain the shortcut. **Ensure all mathematical expressions are in LaTeX format and correctly wrapped in dollar signs ($...$ for inline and $$...$$ for block) for proper rendering.**

Ensure the questions are relevant, clear, and unambiguous.
`;

// Flow definition
const generateMockExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMockExamQuestionsFlow',
    inputSchema: GenerateMockExamQuestionsInputSchema,
    outputSchema: GenerateMockExamQuestionsOutputSchema,
  },
  async (input) => {
    if (!input.apiKey) {
        throw new Error('API key is required.');
    }
    
    // Dynamically create a Genkit instance with the user's API key
    const userAi = genkit({
        plugins: [googleAI({ apiKey: input.apiKey })],
        model: 'googleai/gemini-2.5-flash',
    });

    // Dynamically define the prompt with the temporary AI instance
    const userPrompt = userAi.definePrompt({
        name: 'generateMockExamQuestionsPrompt_dynamic',
        input: {schema: GenerateMockExamQuestionsInputSchema},
        output: {schema: GenerateMockExamQuestionsOutputSchema},
        prompt: promptTemplate,
        config: {
          temperature: 0.3,
        },
    });

    const {output} = await userPrompt(input);
    
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
