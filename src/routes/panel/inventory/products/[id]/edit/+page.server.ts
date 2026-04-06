import { InventoryService } from '$lib/server/modules/inventory/service';
import { db } from '$lib/server/database';
import { productCategories } from '$lib/server/database/schemas/inventory';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

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

export const load: PageServerLoad = async ({ params, locals }) => {
	const service = new InventoryService();
	const product = await service.getProduct(params.id);
	const companyId = locals.activeCompany?.id;

	if (!product) {
		throw redirect(303, '/panel/inventory/products');
	}

	// Load Categories for dropdown
	const categories = companyId
		? await db.select().from(productCategories).where(eq(productCategories.companyId, companyId))
		: [];

	const form = await superValidate(
		{
			...product,
			code: product.code || undefined,
			brand: product.brand || undefined,
			unit: product.unit || undefined,
			image: product.image || undefined,
			categoryId: product.categoryId || undefined,
			type: product.type || 'goods',
			description: product.description || undefined,
			salesPrice: Number(product.salesPrice),
			cost: Number(product.cost)
		},
		zod(productSchema)
	);

	return { form, product, categories };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new InventoryService();
		try {
			await service.updateProduct(params.id, {
				...form.data,
				salesPrice: form.data.salesPrice.toString(),
				cost: form.data.cost.toString()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: 'Failed to update product' });
		}

		throw redirect(303, '/panel/inventory/products');
	}
};
