export class PdfClient {
	static async generateInvoice(invoice: {
		number: string;
		issueDate: string | Date;
		items: Array<{ description: string; quantity: number; unitPrice: number }>;
		total: number;
	}) {
		// Dynamic import to avoid heavy building
		const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
			import('pdfmake/build/pdfmake'),
			import('pdfmake/build/vfs_fonts')
		]);

		// Initialize vfs (Virtual File System) for fonts
		// @ts-expect-error - pdfMake types don't include vfs property
		pdfMake.vfs = pdfFonts.pdfMake.vfs;
		const docDefinition = {
			content: [
				{ text: `Invoice #${invoice.number}`, style: 'header' },
				{
					text: `Date: ${new Date(invoice.issueDate).toLocaleDateString()}`,
					margin: [0, 0, 0, 20]
				},
				{
					table: {
						headerRows: 1,
						widths: ['*', 'auto', 'auto', 'auto'],
						body: [
							['Description', 'Quantity', 'Unit Price', 'Total'],
							...invoice.items.map((item) => [
								item.description,
								item.quantity,
								item.unitPrice,
								(item.quantity * item.unitPrice).toFixed(2)
							]),
							[{ text: 'Total', colSpan: 3, alignment: 'right', bold: true }, {}, {}, invoice.total]
						]
					}
				}
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 10]
				}
			}
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pdfMake.createPdf(docDefinition as any).download(`Invoice-${invoice.number}.pdf`);
	}
}
