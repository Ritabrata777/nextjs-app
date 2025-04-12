// SummarizeMedicalReport flow translates medical jargon into simple, understandable language.
// It takes medical report text as input and returns a simplified summary.

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {generatePdf, SimplifiedReport} from '@/services/pdf-generator';

const SummarizeMedicalReportInputSchema = z.object({
  reportText: z.string().describe('The text content of the medical report to be simplified.'),
});
export type SummarizeMedicalReportInput = z.infer<typeof SummarizeMedicalReportInputSchema>;

const SummarizeMedicalReportOutputSchema = z.object({
  simplifiedReport: z.object({
    title: z.string().describe('The title of the simplified report.'),
    sections: z.array(
      z.object({
        heading: z.string().describe('The heading of the section.'),
        content: z.string().describe('The simplified content of the section.'),
      })
    ).describe('The sections of the simplified report.'),
  }).describe('The simplified medical report.'),
});
export type SummarizeMedicalReportOutput = z.infer<typeof SummarizeMedicalReportOutputSchema>;

export async function summarizeMedicalReport(
  input: SummarizeMedicalReportInput
): Promise<SummarizeMedicalReportOutput> {
  return summarizeMedicalReportFlow(input);
}

const summarizeMedicalReportPrompt = ai.definePrompt({
  name: 'summarizeMedicalReportPrompt',
  input: {
    schema: z.object({
      reportText: z.string().describe('The text content of the medical report to be simplified.'),
    }),
  },
  output: {
    schema: z.object({
      simplifiedReport: z.object({
        title: z.string().describe('The title of the simplified report.'),
        sections: z.array(
          z.object({
            heading: z.string().describe('The heading of the section.'),
            content: z.string().describe('The simplified content of the section.'),
          })
        ).describe('The sections of the simplified report.'),
      }).describe('The simplified medical report.'),
    }),
  },
  prompt: `You are a medical expert skilled at translating complex medical jargon into simple, understandable language for patients.  Simplify the following medical report so that a layperson can easily understand it.  Organize the simplified report into sections with clear headings.

Medical Report:
{{{reportText}}}`,
});

const summarizeMedicalReportFlow = ai.defineFlow<
  typeof SummarizeMedicalReportInputSchema,
  typeof SummarizeMedicalReportOutputSchema
>({
  name: 'summarizeMedicalReportFlow',
  inputSchema: SummarizeMedicalReportInputSchema,
  outputSchema: SummarizeMedicalReportOutputSchema,
},
async input => {
  const {output} = await summarizeMedicalReportPrompt(input);
  return output!;
});
