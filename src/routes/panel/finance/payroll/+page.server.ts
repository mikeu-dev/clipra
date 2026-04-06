import type { PageServerLoad, Actions } from './$types';
import { PayrollModule } from '$lib/server/modules/payroll/module';
import { fail } from '@sveltejs/kit';

const payrollService = PayrollModule.getService();

export const load: PageServerLoad = async ({ locals }) => {
	const companyId = locals.activeCompany?.id;
	if (!companyId) return { batches: [] };

	const batches = await payrollService.getAllBatches(companyId);
	return { batches };
};

export const actions: Actions = {
	generate: async ({ request, locals }) => {
		const companyId = locals.activeCompany?.id;
		if (!companyId) return fail(401, { error: 'No active company' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const periodStr = formData.get('period') as string;

		if (!name || !periodStr) {
			return fail(400, { error: 'Name and period are required' });
		}

		try {
			const period = new Date(periodStr);
			const result = await payrollService.generatePayrollBatch(companyId, name, period);
			return { success: true, ...result };
		} catch (error) {
			console.error(error);
			const message = error instanceof Error ? error.message : 'Failed to generate payroll';
			return fail(500, { error: message });
		}
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const batchId = formData.get('batchId') as string;
		const status = formData.get('status') as 'draft' | 'processed' | 'paid' | 'cancelled';

		if (!batchId || !status) return fail(400, { error: 'Missing data' });

		try {
			await payrollService.updateBatchStatus(batchId, status);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update status' });
		}
	}
};
