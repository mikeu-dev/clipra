import { CRMService } from '$lib/server/modules/crm/service';
import * as m from '$lib/paraglide/messages.js';

import { InventoryRepository } from '$lib/server/modules/inventory/repository';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/database';
import { leads } from '$lib/server/database/schemas/crm'; // Assuming we can link to a client/lead
import { eq } from 'drizzle-orm';

// Define schema for form
// Ideally we handle multiple lines, but for simple form handling we might limit to 1 item or use a JSON string for lines in MVP
// Or we just allow creating a header first, then adding lines? No, let's try to add one line item in the create form for simplicity.
const orderSchema = z.object({
	clientId: z.string().min(1, 'Client is required'),
	productId: z.string().min(1, 'Product is required'),
	quantity: z.number().min(1).default(1),
	price: z.number().min(0).default(0),
	notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(orderSchema));
	const companyId = locals.activeCompany?.id;

	if (!companyId) return { form, clients: [], products: [] };

	const inventoryRepo = new InventoryRepository();
	const productsList = await inventoryRepo.getProducts(companyId);

	// Get potential clients (leads who are won, or just all leads for now)
	// In a real system we would have a separate "Contacts/Partners" table.
	// For now, let's use 'leads' table as clients.
	const clientsList = await db.select().from(leads).where(eq(leads.companyId, companyId));

	return {
		form,
		products: productsList,
		clients: clientsList
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(orderSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new CRMService();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			// Calculate line subtotal
			const subtotal = form.data.price * form.data.quantity;

			await service.createQuotation(
				{
					clientId: form.data.clientId,
					companyId,
					date: new Date(),
					total: subtotal.toString(),
					subtotal: subtotal.toString(),
					notes: form.data.notes
				},
				[
					{
						// Single line item for MVP
						companyId,
						productId: form.data.productId,
						quantity: form.data.quantity.toString(),
						unitPrice: form.data.price.toString(),
						subtotal: subtotal.toString(),
						description: 'Initial Item'
					}
				]
			);
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: m.msg_error_failed_create_quotation() });
		}

		throw redirect(303, '/panel/crm/orders');
	}
};
