import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InvoiceController } from '$lib/server/modules/invoice/controller';
import { PdfService } from '$lib/server/modules/invoice/pdf.service';

export const GET: RequestHandler = async ({ params }) => {
	// Auth check
	// if (!locals.user) throw error(401, 'Unauthorized');

	const controller = new InvoiceController();
	const invoice = await controller.getWithDetails(params.id);

	if (!invoice) throw error(404, 'Invoice not found');

	try {
		const pdfStream = PdfService.generateInvoicePdf(invoice);

		return new Response(pdfStream, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
			}
		});
	} catch (err) {
		console.error(err);
		throw error(500, 'Failed to generate PDF');
	}
};
