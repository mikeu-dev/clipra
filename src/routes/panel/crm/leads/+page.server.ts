import { CRMService } from '$lib/server/modules/crm/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new CRMService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	// Checking if getLeads exists in Service.
	// It's not in Service yet (Step 241), only createQuotation and confirmOrder.
	// Need to add getLeads to CRMService.

	// I'll add getLeads to CRMService in next step (or same via replace if confident, but let's stick to pattern)
	// Actually, to avoid the back-and-forth failure pattern, I will assume it exists and add it immediately after this tool call.

	try {
		const leads = await service.getLeads(companyId);
		return {
			leads
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load leads');
	}
};
