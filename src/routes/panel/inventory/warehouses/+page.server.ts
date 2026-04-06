import { InventoryService } from '$lib/server/modules/inventory/service';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const warehouseSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255),
	code: z.string().min(1, 'Code is required').max(50),
	address: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
	const service = new InventoryService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) return { warehouses: [], form: await superValidate(zod(warehouseSchema)) };

	const warehouses = await service.getWarehouses(companyId);
	const form = await superValidate(zod(warehouseSchema));

	return { warehouses, form };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await superValidate(request, zod(warehouseSchema));
		if (!form.valid) return fail(400, { form });

		const service = new InventoryService();
		const companyId = locals.activeCompany?.id;
		if (!companyId) return fail(401);

		if (form.data.id) {
			await service.updateWarehouse(form.data.id, {
				name: form.data.name,
				code: form.data.code,
				address: form.data.address,
				latitude: form.data.latitude,
				longitude: form.data.longitude
			});
		} else {
			await service.createWarehouse({
				id: uuidv4(),
				companyId,
				name: form.data.name,
				code: form.data.code,
				address: form.data.address,
				latitude: form.data.latitude,
				longitude: form.data.longitude
			});
		}

		return { form };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400);

		const service = new InventoryService();
		await service.deleteWarehouse(id);
		return { success: true };
	}
};
