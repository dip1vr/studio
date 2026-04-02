
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
  subjects: z.array(z.string()).optional().describe('A list of subjects for the questions (optional).'),
  topic: z.string().optional().describe('A specific topic within the subjects (optional).'),
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
  subject: z.string().describe('The subject this question belongs to.'),
  topic: z.string().describe('The topic this question belongs to.'),
});

const GenerateMockExamQuestionsOutputSchema = z.array(QuestionOutputSchema).describe('An array of generated multiple-choice questions.');
export type GenerateMockExamQuestionsOutput = z.infer<typeof GenerateMockExamQuestionsOutputSchema>;

// Prompt template string
const promptTemplate = `You are an expert at creating multiple-choice questions for Indian Government Exams. Your primary goal is accuracy and factual correctness.

Your task is to generate {{numberOfQuestions}} unique multiple-choice questions (MCQs) in {{language}} for the "{{exam}}" exam.

The difficulty level should be "{{difficulty}}".

{{#if subjects}}
Focus on the following subjects: {{#each subjects}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}
{{#if topic}}
Within those subjects, specifically cover this topic: "{{topic}}".
{{/if}}

{{#if suggestion}}
**USER SUGGESTION:** The user has provided the following specific instructions. Adhere to them carefully: "{{suggestion}}"
{{/if}}

**VERY IMPORTANT INSTRUCTIONS FOR JSON, MATH & LATEX FORMATTING:**

1.  **JSON Backslash Escaping:** This is the most critical rule. Because your output is inside a JSON string, every single backslash \`\\\` in your LaTeX code MUST be written as a double backslash \`\\\\\`.
    - For example, to render a fraction, you MUST write \`\\\\frac{a}{b}\`. To render \`\\left(\`, you must write \`\\\\left(\`.
    - Every LaTeX command (\`\\\\frac\`, \`\\\\left\`, \`\\\\right\`, \`\\\\times\`, \`\\\\sqrt\`, etc.) must begin with a **double backslash**.

2.  **LaTeX for Formulas Only:**
    - **USE** single dollar signs (\`$...$\`) for inline mathematical formulas (e.g., \`$a^2 + b^2 = c^2$\`).
    - **USE** double dollar signs (\`$$...$$\`) for block-level mathematical formulas (e.g., \`$$ \\\\frac{a}{b} $$\`).
    - **DO NOT** wrap standalone numbers, quantities, currency symbols (₹, $), or years in dollar signs. For example, write "₹15000", "10%", "the year 2023" as plain text, NOT "\`$₹15000$\`", "\`$10\\\\%\`", or "\`$2023$\`". Dollar signs are ONLY for actual LaTeX math.
    - **VERIFY** that your LaTeX is valid. Ensure all brackets are closed.

3.  **Chain of Thought Process:** Before creating the JSON, first, think step-by-step to formulate the question text, determine its subject and topic, find the single, unambiguously correct answer, and create a detailed explanation. Only after this internal verification should you create the multiple-choice options. Ensure one option is 100% correct and the others are plausible but incorrect distractors.

4.  **Subject-Specific Rules:**
    - For "Quantitative Aptitude" or "Mathematics": Solve the question yourself step-by-step to ensure the correct answer is generated accurately before creating the options.
    - For "English": Strictly adhere to established grammar rules.
    - For "Reasoning": Double-check the logic of any patterns to ensure it's not open to interpretation.

Your final output **MUST** be a JSON array of question objects. Each object must have:
- 'questionText': The question itself. Adhere strictly to the LaTeX formatting rules above.
- 'options': An array of exactly four distinct answer choices. These should be plain text and should NOT contain dollar signs unless they are part of a valid LaTeX formula.
- 'correctAnswerIndex': The 0-indexed number (0, 1, 2, or 3) corresponding to the correct answer.
- 'explanation': A detailed, step-by-step explanation. First, explain the conventional method. Then, if a faster method exists, add a section titled "**Short Trick:**" and explain the shortcut. **All mathematical expressions and formulas in the explanation must be in valid, backslash-escaped LaTeX format and correctly wrapped in dollar signs (\`$...\`$ for inline and \`$$...$$\` for block).**
- 'subject': The subject this question belongs to.
- 'topic': The specific topic this question belongs to.

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
