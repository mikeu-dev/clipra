import { PurchaseService } from '$lib/server/modules/purchase/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new PurchaseService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	try {
		const requisitions = await service.getRequisitions(companyId);
		return {
			requisitions
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load purchase requisitions');
	}
};
