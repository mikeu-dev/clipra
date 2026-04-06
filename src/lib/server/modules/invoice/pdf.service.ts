import type { Invoice } from '$lib/server/database/schemas';

/*
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfmake = require('pdfmake');
// Handle different export structures (CJS vs ESM default)
const PdfPrinter = pdfmake.PdfPrinter || pdfmake.default || pdfmake;
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics:
            'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
    }
};

const printer = new PdfPrinter(fonts);
*/

export class PdfService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static generateInvoicePdf(invoice: Invoice | any): ReadableStream {
		console.warn('PDF generation is temporarily disabled due to build issues with pdfmake');

		// Return a simple text stream explaining the issue
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(`PDF generation for Invoice ${invoice.number} is temporarily unavailable.`)
				);
				controller.close();
			}
		});

		return stream;

		/*
        const docDefinition: TDocumentDefinitions = {
            // ... content ...
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        return new ReadableStream({
            start(controller) {
                pdfDoc.on('data', (chunk: any) => controller.enqueue(chunk));
                pdfDoc.on('end', () => controller.close());
                pdfDoc.on('error', (err: any) => controller.error(err));
                pdfDoc.end();
            }
        });
        */
	}
}
