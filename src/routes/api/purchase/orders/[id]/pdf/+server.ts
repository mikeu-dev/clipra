import { PurchaseService } from '$lib/server/modules/purchase/service';
import { PurchasePdfService } from '$lib/server/modules/purchase/pdf.service';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const service = new PurchaseService();
	const order = await service.getOrder(params.id);

	if (!order) {
		throw error(404, 'Purchase Order not found');
	}

	const stream = PurchasePdfService.generatePoPdf(order);

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="PO-${order.number}.pdf"`
		}
	});
};
