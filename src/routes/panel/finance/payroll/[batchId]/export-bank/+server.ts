import { PayrollModule } from '$lib/server/modules/payroll/module';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const payrollService = PayrollModule.getService();

export const GET: RequestHandler = async ({ params }) => {
	const { batchId } = params;
	const batch = await payrollService.getBatchById(batchId);

	if (!batch) {
		throw error(404, 'Batch not found');
	}

	const csv = await payrollService.getBankTransferCsv(batchId);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="bank-transfer-${batchId}.csv"`
		}
	});
};
