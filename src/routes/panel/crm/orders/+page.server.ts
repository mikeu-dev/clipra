import { CRMService } from '$lib/server/modules/crm/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new CRMService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	try {
		const orders = await service.getSalesOrders(companyId);
		return {
			orders
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load sales orders');
	}
};
