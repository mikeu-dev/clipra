import { PurchaseService } from '$lib/server/modules/purchase/service';
import { PurchasePdfService } from '$lib/server/modules/purchase/pdf.service';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const service = new PurchaseService();
	const req = await service.getRequisition(params.id);

	if (!req) {
		throw error(404, 'Requisition not found');
	}

	const stream = PurchasePdfService.generatePrPdf(req);

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="PR-${req.number}.pdf"`
		}
	});
};
