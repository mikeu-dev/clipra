import { InventoryRepository } from '$lib/server/modules/inventory/repository';
import * as m from '$lib/paraglide/messages.js';

import { InventoryService } from '$lib/server/modules/inventory/service';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/database';
import { locations } from '$lib/server/database/schemas/inventory';
import { eq } from 'drizzle-orm';

// Define schema for form
const moveSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	locationId: z.string().min(1, 'Source Location is required'),
	locationDestId: z.string().min(1, 'Destination Location is required'),
	quantity: z.number().min(0.01, 'Quantity must be positive'),
	reference: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(moveSchema));
	const companyId = locals.activeCompany?.id;

	if (!companyId) return { form, products: [], locations: [] };

	// Fetch master data
	// Ideally use Repo methods, but for quick dropdown population we can query directly or expose methods
	// Let's query directly for now to save Service clutter or use existing Repo methods if available
	// We added getProducts, let's use it. We need getLocations too.

	const repo = new InventoryRepository();
	const allProducts = await repo.getProducts(companyId);
	const allLocations = await db.select().from(locations).where(eq(locations.companyId, companyId));

	return {
		form,
		products: allProducts,
		locations: allLocations
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(moveSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new InventoryService();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			await service.processStockMove({
				companyId,
				...form.data,
				quantity: form.data.quantity.toString() // Convert for standard decimal handling
			});
		} catch (e: unknown) {
			console.error(e);
			return fail(500, { form, message: m.msg_error_failed_process_stock_move() });
		}

		throw redirect(303, '/panel/inventory/stock_moves');
	}
};
