import { InvoiceController } from '$lib/server/modules/invoice/controller';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const controller = new InvoiceController();
	const invoice = await controller.getWithDetails(params.id);

	if (!invoice) {
		error(404, 'Invoice not found');
	}

	return { invoice };
};
