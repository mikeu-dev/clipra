import { PayrollService } from '$lib/server/modules/payroll/service';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/middleware';

const payrollService = new PayrollService();

export const GET: RequestHandler = async (event) => {
	requireAuth(event);

	const { url } = event;
	const batchId = url.searchParams.get('batchId');

	if (!batchId) {
		return json({ error: 'batchId required' }, { status: 400 });
	}

	try {
		const csv = await payrollService.getBankTransferCsv(batchId);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="payroll_${batchId}.csv"`
			}
		});
	} catch (e) {
		console.error(e);
		return json({ error: 'Export failed' }, { status: 500 });
	}
};
