import { InventoryService } from '$lib/server/modules/inventory/service';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '$lib/server/database';
import { productCategories } from '$lib/server/database/schemas/inventory';

// Define schema for form
const productSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	code: z.string().max(100).optional(),
	brand: z.string().max(100).optional(),
	unit: z.string().max(50).optional(),
	image: z.string().optional(),
	categoryId: z.string().optional(),
	type: z.enum(['goods', 'service', 'consumable']).default('goods'),
	salesPrice: z.number().min(0).default(0),
	cost: z.number().min(0).default(0),
	description: z.string().optional()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(productSchema));
	// Fetch categories for dropdown
	const categories = await db.select().from(productCategories);

	return {
		form,
		categories
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new InventoryService();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: 'No active company found' });
		}

		try {
			await service.createProduct({
				id: uuidv4(),
				companyId,
				isActive: true,
				...form.data,
				salesPrice: form.data.salesPrice.toString(),
				cost: form.data.cost.toString()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: 'Failed to create product' });
		}

		throw redirect(303, '/panel/inventory/products');
	}
};
