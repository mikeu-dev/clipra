import { InvoiceController } from '$lib/server/modules/invoice/controller';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure authentication if not global
	const controller = new InvoiceController(locals.activeCompany?.id);
	const invoices = await controller.getAllWithClient();
	return { invoices };
};
