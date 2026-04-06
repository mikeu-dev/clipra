import { PurchaseService } from '$lib/server/modules/purchase/service';
import * as m from '$lib/paraglide/messages.js';

import { InventoryRepository } from '$lib/server/modules/inventory/repository';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/database';
import { clients } from '$lib/server/database/schemas/clients';
import { eq } from 'drizzle-orm';

// Define schema for form
const orderSchema = z.object({
	supplierId: z.string().min(1, 'Supplier is required'),
	productId: z.string().min(1, 'Product is required'),
	quantity: z.number().min(1).default(1),
	price: z.number().min(0).default(0),
	notes: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(orderSchema));
	const companyId = locals.activeCompany?.id;

	if (!companyId) return { form, suppliers: [], products: [] };

	const inventoryRepo = new InventoryRepository();
	const productsList = await inventoryRepo.getProducts(companyId);

	// Get potential suppliers (Clients)
	const suppliersList = await db.select().from(clients).where(eq(clients.companyId, companyId));

	return {
		form,
		products: productsList,
		suppliers: suppliersList
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(orderSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new PurchaseService();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			// Calculate line subtotal
			const subtotal = form.data.price * form.data.quantity;

			await service.createOrder(
				{
					supplierId: form.data.supplierId,
					companyId,
					date: new Date(),
					total: subtotal.toString(),
					subtotal: subtotal.toString(),
					notes: form.data.notes
				},
				[
					{
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
			return fail(500, { form, message: m.msg_error_failed_create_purchase_order() });
		}

		throw redirect(303, '/panel/purchase/orders');
	}
};
