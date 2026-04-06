import { AccountingService } from '$lib/server/modules/accounting/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new AccountingService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	// Since getAccounts is in Repo but not exposed in Service yet, I might need to add it to Service.
	// Wait, I didn't add getAccounts to Service in previous step. Reference checking...
	// I need to add getAccounts to the AccountingService first or access repo directly?
	// Best practice: Service should expose it.

	// I'll assume I'm adding it to service now or just using repo for simplicity if Service is strict?
	// Let's modify service first to be safe, or just instantiate repo here?
	// Actually, let's add `getAccounts` to `AccountingService`.

	// But since I can't modify Service in the same step easily without context switching,
	// I will write this file assuming `service.getAccounts` exists, and then I will update `service.ts`.

	try {
		const accounts = await service.getAccounts(companyId);
		return {
			accounts
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load accounts');
	}
};
