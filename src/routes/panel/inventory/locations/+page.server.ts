import { InventoryService } from '$lib/server/modules/inventory/service';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const locationSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	usage: z.string().default('internal')
});

export const load: PageServerLoad = async ({ locals }) => {
	const service = new InventoryService();
	const companyId = locals.activeCompany?.id;

	if (!companyId)
		return { locations: [], warehouses: [], form: await superValidate(zod(locationSchema)) };

	const locations = await service.getLocations(companyId);
	const warehouses = await service.getWarehouses(companyId);
	const form = await superValidate(zod(locationSchema));

	return {
		locations: locations.map((l) => ({
			...l,
			warehouseName: warehouses.find((w) => w.id === l.warehouseId)?.name || 'Unknown'
		})),
		warehouses,
		form
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await superValidate(request, zod(locationSchema));
		if (!form.valid) return fail(400, { form });

		const service = new InventoryService();
		const companyId = locals.activeCompany?.id;
		if (!companyId) return fail(401);

		if (form.data.id) {
			await service.updateLocation(form.data.id, {
				name: form.data.name,
				warehouseId: form.data.warehouseId,
				usage: form.data.usage
			});
		} else {
			await service.createLocation({
				id: uuidv4(),
				companyId,
				name: form.data.name,
				warehouseId: form.data.warehouseId,
				usage: form.data.usage,
				isActive: true
			});
		}

		return { form };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400);

		const service = new InventoryService();
		await service.deleteLocation(id);
		return { success: true };
	},
	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const isActive = formData.get('isActive') === 'true';
		if (!id) return fail(400);

		const service = new InventoryService();
		await service.updateLocation(id, { isActive: !isActive });
		return { success: true };
	}
};
