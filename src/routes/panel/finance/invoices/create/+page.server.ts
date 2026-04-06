import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { InvoiceController } from '$lib/server/modules/invoice/controller';
import { ClientController } from '$lib/server/modules/client/controller';
import { ProjectController } from '$lib/server/modules/project/controller';

export const load: PageServerLoad = async () => {
	const clientController = new ClientController();
	const projectController = new ProjectController();

	return {
		clients: await clientController.index(),
		projects: await projectController.index()
	};
};

export const actions: Actions = {
	createFullInvoice: async ({ request }) => {
		const formData = await request.formData();
		const clientId = formData.get('clientId') as string;
		const projectId = formData.get('projectId') as string;
		const number = formData.get('number') as string;
		const issueDate = formData.get('issueDate') as string;
		const dueDate = formData.get('dueDate') as string;
		const notes = formData.get('notes') as string;

		// Items parsing
		const itemDescriptions = formData.getAll('itemDescription') as string[];
		const itemQuantities = formData.getAll('itemQuantity') as string[];
		const itemPrices = formData.getAll('itemPrice') as string[];

		if (!clientId || !number || !issueDate) {
			return fail(400, { missing: true });
		}

		let subtotal = 0;
		const items = itemDescriptions.map((desc, i) => {
			const qty = Number(itemQuantities[i]) || 0;
			const price = Number(itemPrices[i]) || 0;
			const amount = qty * price;
			subtotal += amount;
			return {
				description: desc,
				quantity: qty.toString(),
				unitPrice: price.toString(),
				amount: amount.toString()
			};
		});

		const taxTotal = 0; // Tax logic can be added later
		const total = subtotal + taxTotal;

		const invoiceData = {
			clientId,
			projectId: projectId || null,
			number,
			issueDate,
			dueDate: dueDate || null,
			notes,
			subtotal: subtotal.toString(),
			taxTotal: taxTotal.toString(),
			total: total.toString(),
			status: 'draft'
		};

		try {
			const controller = new InvoiceController();
			// @ts-expect-error createFullInvoice method exists but not in base type
			await controller.createFullInvoice(invoiceData, items);
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'Failed to create invoice' });
		}

		throw redirect(303, '/panel/finance/invoices');
	}
};
