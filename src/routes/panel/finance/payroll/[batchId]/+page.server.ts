import type { PageServerLoad, Actions } from './$types';
import { PayrollModule } from '$lib/server/modules/payroll/module';
import { fail, error } from '@sveltejs/kit';

const payrollService = PayrollModule.getService();

export const load: PageServerLoad = async ({ params }) => {
	const { batchId } = params;

	const batch = await payrollService.getBatchById(batchId);
	if (!batch) {
		throw error(404, 'Batch not found');
	}

	const payrolls = await payrollService.getPayrollsByBatchId(batchId);

	return { batch, payrolls };
};

export const actions: Actions = {
	markPaid: async ({ request }) => {
		const formData = await request.formData();
		const payrollId = formData.get('payrollId') as string;

		if (!payrollId) return fail(400, { error: 'Payroll ID required' });

		try {
			await payrollService.markPayrollAsPaid(payrollId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update' });
		}
	},

	updateBatchStatus: async ({ request, params }) => {
		const formData = await request.formData();
		const status = formData.get('status') as 'draft' | 'processed' | 'paid' | 'cancelled';

		if (!status) return fail(400, { error: 'Status required' });

		try {
			await payrollService.updateBatchStatus(params.batchId, status);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update status' });
		}
	},

	processBatch: async ({ locals, params }) => {
		const userId = locals.user?.id;
		if (!userId) return fail(401, { error: 'Unauthorized' });

		try {
			const result = await payrollService.processBatchPayment(params.batchId);
			return { ...result };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to process batch';
			return fail(500, { error: message });
		}
	},

	verifyAccount: async ({ request }) => {
		const formData = await request.formData();
		const employeeId = formData.get('employeeId') as string;

		if (!employeeId) return fail(400, { error: 'Employee ID required' });

		try {
			const result = await payrollService.verifyEmployeeAccount(employeeId);
			return { success: true, accountName: result.name };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Verification failed';
			return fail(500, { error: message });
		}
	}
};
