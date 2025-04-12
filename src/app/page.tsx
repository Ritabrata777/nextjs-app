'use client';

import React, {useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {generatePdf, SimplifiedReport} from '@/services/pdf-generator';
import {Download, Upload} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {summarizeMedicalReport} from '@/ai/flows/summarize-medical-report';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';

const placeholderReport = `
Patient Name: John Doe
Patient ID: 1234567
Date of Birth: 1960-01-01
Report Date: 2024-01-01

Medical Condition:
The patient presents with symptoms indicative of chronic obstructive pulmonary disease (COPD), including but not limited to persistent cough, dyspnea, and wheezing. Pulmonary function tests (PFTs) reveal a forced expiratory volume in one second (FEV1) of 60% predicted, confirming moderate COPD. Chest radiography illustrates hyperinflation and flattened diaphragms, consistent with emphysematous changes. Arterial blood gas (ABG) analysis demonstrates compensated respiratory acidosis with a PaCO2 of 48 mmHg and a PaO2 of 65 mmHg.

Recommendations:
1. Initiate bronchodilator therapy with a combination of long-acting beta-agonists (LABA) and inhaled corticosteroids (ICS).
2. Prescribe supplemental oxygen therapy to maintain oxygen saturation levels above 90%.
3. Enroll the patient in a pulmonary rehabilitation program to improve exercise tolerance and quality of life.
4. Advise smoking cessation and provide resources for smoking cessation support.
5. Administer influenza and pneumococcal vaccinations to reduce the risk of respiratory infections.
6. Monitor pulmonary function and arterial blood gases regularly to assess disease progression and treatment response.
`;

export default function Home() {
  const [reportText, setReportText] = useState<string>(placeholderReport);
  const [simplifiedReport, setSimplifiedReport] = useState<SimplifiedReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {toast} = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        // Set the report text to the file content
        const fileContent = reader.result as string;
        setReportText(fileContent);
        setIsLoading(true);
        try {
          const result = await summarizeMedicalReport({reportText: fileContent});
          setSimplifiedReport(result.simplifiedReport);
          toast({
            title: 'Report simplified!',
            description: 'The medical report has been successfully simplified.',
          });
        } catch (error: any) {
          console.error('Error simplifying report:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to simplify the medical report.',
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsText(file);
    });
  }, []);
  const {getRootProps, getInputProps} = useDropzone({onDrop, accept: {'text/plain': ['.txt', '.pdf', '.docx']}});

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeMedicalReport({reportText: reportText});
      setSimplifiedReport(result.simplifiedReport);
      toast({
        title: 'Report simplified!',
        description: 'The medical report has been successfully simplified.',
      });
    } catch (error: any) {
      console.error('Error simplifying report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to simplify the medical report.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!simplifiedReport) {
      toast({
        variant: 'destructive',
        title: 'No report to download',
        description: 'Please simplify a report before downloading.',
      });
      return;
    }

    try {
      const pdfBuffer = await generatePdf(simplifiedReport);
      const blob = new Blob([pdfBuffer], {type: 'application/pdf'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'simplified-report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'The simplified report is downloading as a PDF.',
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate PDF.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-light-grey p-4">
      <h1 className="text-2xl font-bold mb-4 text-teal-500">MediTranslate</h1>
      <Card className="w-full max-w-3xl mb-4">
        <CardHeader>
          <CardTitle>Upload Medical Report</CardTitle>
          <CardDescription>
            Drag and drop a file here, or click to select a file to upload.
            Supported formats: .txt, .pdf, .docx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className="dropzone w-full p-6 border-2 border-dashed rounded-md cursor-pointer bg-white">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-6 w-6 text-gray-500 mb-2"/>
              <p className="text-gray-500">Click or drag and drop to upload</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mb-4">
        <CardHeader>
          <CardTitle>Medical Report Text</CardTitle>
          <CardDescription>Enter or paste the medical report text here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            className="w-full h-48"
            placeholder="Paste medical report text here..."
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSummarize} disabled={isLoading}>
            {isLoading ? 'Simplifying...' : 'Simplify Report'}
          </Button>
        </CardFooter>
      </Card>

      {simplifiedReport && (
        <Card className="w-full max-w-3xl mb-4">
          <CardHeader>
            <CardTitle>Simplified Report</CardTitle>
            <CardDescription>Here is the simplified version of your medical report.</CardDescription>
          </CardHeader>
          <CardContent>
            {simplifiedReport.sections.map((section, index) => (
              <div key={index} className="mb-4">
                <h2 className="text-lg font-semibold mb-2 text-teal-500">{section.heading}</h2>
                <p className="text-gray-700">{section.content}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} variant="secondary">
              Download PDF <Download className="ml-2 h-4 w-4"/>
            </Button>
          </CardFooter>
        </Card>
      )}
      {simplifiedReport === null && !isLoading && (
        <Card className="w-full max-w-3xl mb-4">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-500">No report simplified yet. Upload or paste a medical report and click simplify.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="mt-4">View Example Report</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Example Medical Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      This is an example of a medical report that you can simplify.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="max-h-80 overflow-auto">
                    <Textarea
                      value={placeholderReport}
                      readOnly
                      className="w-full h-full"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setReportText(placeholderReport)}>Use Example</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
