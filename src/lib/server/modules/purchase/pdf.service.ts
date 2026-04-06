export class PurchasePdfService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static generatePoPdf(order: any): ReadableStream {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						`PDF generation for Purchase Order ${order.number} is temporarily unavailable.\n`
					)
				);
				controller.enqueue(
					encoder.encode(`Supplier: ${order.supplier?.name || order.supplierId}\n`)
				);
				controller.enqueue(encoder.encode(`Total: ${order.total}\n`));
				controller.close();
			}
		});

		return stream;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static generatePrPdf(req: any): ReadableStream {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						`PDF generation for Requisition ${req.number} is temporarily unavailable.\n`
					)
				);
				controller.enqueue(encoder.encode(`Requester: ${req.requestedBy?.name}\n`));
				controller.enqueue(encoder.encode(`Total Estimate: ${req.totalAmount}\n`));
				controller.close();
			}
		});

		return stream;
	}
}
