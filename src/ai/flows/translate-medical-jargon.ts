// src/ai/flows/translate-medical-jargon.ts
'use server';
/**
 * @fileOverview Translates complex medical jargon into understandable language.
 *
 * - translateMedicalJargon - A function that translates medical jargon in a report into plain language.
 * - TranslateMedicalJargonInput - The input type for the translateMedicalJargon function.
 * - TranslateMedicalJargonOutput - The return type for the translateMedicalJargon function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TranslateMedicalJargonInputSchema = z.object({
  reportText: z.string().describe('The medical report text to be translated.'),
});
export type TranslateMedicalJargonInput = z.infer<typeof TranslateMedicalJargonInputSchema>;

const TranslateMedicalJargonOutputSchema = z.object({
  simplifiedReport: z.object({
    title: z.string().describe('The title of the simplified report.'),
    sections: z
      .array(z.object({
        heading: z.string().describe('The heading of the section.'),
        content: z.string().describe('The content of the section in plain language.'),
      }))
      .describe('The sections of the simplified report.'),
  }).describe('The simplified medical report in plain language.'),
});
export type TranslateMedicalJargonOutput = z.infer<typeof TranslateMedicalJargonOutputSchema>;

export async function translateMedicalJargon(input: TranslateMedicalJargonInput): Promise<TranslateMedicalJargonOutput> {
  return translateMedicalJargonFlow(input);
}

const translateMedicalJargonPrompt = ai.definePrompt({
  name: 'translateMedicalJargonPrompt',
  input: {
    schema: z.object({
      reportText: z.string().describe('The medical report text to be translated.'),
    }),
  },
  output: {
    schema: z.object({
      simplifiedReport: z.object({
        title: z.string().describe('The title of the simplified report.'),
        sections: z
          .array(z.object({
            heading: z.string().describe('The heading of the section.'),
            content: z.string().describe('The content of the section in plain language.'),
          }))
          .describe('The sections of the simplified report.'),
      }).describe('The simplified medical report in plain language.'),
    }),
  },
  prompt: `You are a medical expert and your task is to translate complex medical terms in a report into plain language that is easy to understand.

  Here is the medical report:
  {{reportText}}

  Please provide a simplified report with clear section headings and content in plain language.
  The output should be a JSON object with the simplified report.`, 
});

const translateMedicalJargonFlow = ai.defineFlow<
  typeof TranslateMedicalJargonInputSchema,
  typeof TranslateMedicalJargonOutputSchema
>({
  name: 'translateMedicalJargonFlow',
  inputSchema: TranslateMedicalJargonInputSchema,
  outputSchema: TranslateMedicalJargonOutputSchema,
}, async input => {
  const {output} = await translateMedicalJargonPrompt(input);
  return output!;
});
