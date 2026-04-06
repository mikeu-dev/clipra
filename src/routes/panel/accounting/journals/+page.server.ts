import { AccountingService } from '$lib/server/modules/accounting/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new AccountingService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	try {
		const entries = await service.getGL(companyId);
		return {
			entries
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load journal entries');
	}
};
