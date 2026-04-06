import { PurchaseService } from '$lib/server/modules/purchase/service';
import * as m from '$lib/paraglide/messages.js';

import { InventoryRepository } from '$lib/server/modules/inventory/repository';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/database';
import { projects } from '$lib/server/database/schemas/projects';
import { clients } from '$lib/server/database/schemas/clients';
import { eq } from 'drizzle-orm';

const requisitionSchema = z.object({
	date: z.string().min(1, 'Date is required'),
	projectId: z.string().optional(),
	description: z.string().min(1, 'Description is required'),
	notes: z.string().optional(),
	items: z
		.array(
			z.object({
				productId: z.string().min(1, 'Product is required'),
				quantity: z.number().min(0.01, 'Quantity must be > 0'),
				estimatedPrice: z.number().min(0, 'Price cannot be negative'),
				description: z.string().optional()
			})
		)
		.min(1, 'At least one item is required')
});

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(requisitionSchema));
	const companyId = locals.activeCompany?.id;

	if (!companyId) return { form, products: [], projects: [] };

	const inventoryRepo = new InventoryRepository();
	const productsList = await inventoryRepo.getProducts(companyId);

	const availableProjects = await db
		.select({
			id: projects.id,
			name: projects.name
		})
		.from(projects)
		.innerJoin(clients, eq(projects.clientId, clients.id))
		.where(eq(clients.companyId, companyId));

	return {
		form,
		products: productsList,
		projects: availableProjects
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(requisitionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new PurchaseService();
		const companyId = locals.activeCompany?.id;
		const userId = locals.user?.id;

		if (!companyId || !userId) {
			return fail(400, { form, message: m.msg_error_no_active_company_or_session() });
		}

		try {
			const reqData = {
				companyId,
				requestedById: userId,
				projectId: form.data.projectId,
				date: new Date(form.data.date),
				description: form.data.description,
				notes: form.data.notes
			};

			const linesData = form.data.items.map((item) => ({
				companyId,
				productId: item.productId,
				description: item.description || 'Item',
				quantity: item.quantity.toString(),
				estimatedUnitPrice: item.estimatedPrice.toString(),
				subtotal: (item.quantity * item.estimatedPrice).toString()
			}));

			await service.createRequisition(reqData, linesData);
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: m.msg_error_failed_create_purchase_requisition() });
		}

		throw redirect(303, '/panel/purchase/requisitions');
	}
};
