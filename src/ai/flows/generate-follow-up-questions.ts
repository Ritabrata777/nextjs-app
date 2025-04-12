'use server';
/**
 * @fileOverview Generates follow-up questions for a simplified medical report.
 *
 * - generateFollowUpQuestions - A function that generates follow-up questions.
 * - GenerateFollowUpQuestionsInput - The input type for the generateFollowUpQuestions function.
 * - GenerateFollowUpQuestionsOutput - The return type for the generateFollowUpQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {SimplifiedReport} from '@/services/pdf-generator';
import {z} from 'genkit';

const GenerateFollowUpQuestionsInputSchema = z.object({
  simplifiedReport: z.custom<SimplifiedReport>().describe('The simplified medical report.'),
});
export type GenerateFollowUpQuestionsInput = z.infer<
  typeof GenerateFollowUpQuestionsInputSchema
>;

const GenerateFollowUpQuestionsOutputSchema = z.object({
  followUpQuestions: z
    .array(z.string())
    .describe('A list of potential follow-up questions for the doctor.'),
});
export type GenerateFollowUpQuestionsOutput = z.infer<
  typeof GenerateFollowUpQuestionsOutputSchema
>;

export async function generateFollowUpQuestions(
  input: GenerateFollowUpQuestionsInput
): Promise<GenerateFollowUpQuestionsOutput> {
  return generateFollowUpQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpQuestionsPrompt',
  input: {
    schema: z.object({
      simplifiedReport: z
        .custom<SimplifiedReport>()
        .describe('The simplified medical report.'),
    }),
  },
  output: {
    schema: z.object({
      followUpQuestions: z
        .array(z.string())
        .describe('A list of potential follow-up questions for the doctor.'),
    }),
  },
  prompt: `Given the following simplified medical report, generate a list of potential follow-up questions for the patient to ask their doctor.

Report Title: {{{simplifiedReport.title}}}

Report Sections:
{{#each simplifiedReport.sections}}
  Heading: {{{heading}}}
  Content: {{{content}}}
{{/each}}

Please provide the questions as a numbered list.
`,
});

const generateFollowUpQuestionsFlow = ai.defineFlow<
  typeof GenerateFollowUpQuestionsInputSchema,
  typeof GenerateFollowUpQuestionsOutputSchema
>(
  {
    name: 'generateFollowUpQuestionsFlow',
    inputSchema: GenerateFollowUpQuestionsInputSchema,
    outputSchema: GenerateFollowUpQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt({simplifiedReport: input.simplifiedReport});
    return output!;
  }
);
