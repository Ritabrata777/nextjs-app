/**
 * Represents the structure of a simplified medical report.
 */
export interface SimplifiedReport {
  /**
   * The title of the report.
   */
  title: string;
  /**
   * The content of the report, divided into sections.
   */
  sections: {
    heading: string;
    content: string;
  }[];
}

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

/**
 * Asynchronously generates a PDF file from a simplified medical report.
 *
 * @param report The simplified report data.
 * @returns A promise that resolves to a Buffer containing the PDF data.
 */
export async function generatePdf(report: SimplifiedReport): Promise<Buffer> {
  // Register custom fonts (required by pdfMake)
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const documentDefinition = {
    content: [
      { text: report.title, style: 'header' },
      ...report.sections.map(section => [
        { text: section.heading, style: 'sectionHeader' },
        { text: section.content, style: 'sectionContent' },
      ]).flat(),
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20], // bottom margin
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5], // top and bottom margin
      },
      sectionContent: {
        fontSize: 12,
        margin: [0, 0, 0, 10], // bottom margin
      },
    },
    defaultStyle: {
      font: 'Helvetica' // Ensure a default font is set
    }
  };

  // Use pdfMake to create the PDF document
  const pdfDocGenerator = pdfMake.createPdfKitDocument(documentDefinition);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    pdfDocGenerator.on('data', (chunk: Uint8Array) => {
      chunks.push(chunk);
    });
    pdfDocGenerator.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    pdfDocGenerator.on('error', reject);

    pdfDocGenerator.end();
  });
}
