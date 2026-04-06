import { CRMService } from '$lib/server/modules/crm/service';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const service = new CRMService();
	// @ts-expect-error: pending fix
	const order = await service.repo.getOrder(params.id);

	if (!order) {
		throw redirect(303, '/panel/crm/orders');
	}

	return { order };
};

export const actions: Actions = {
	createInvoice: async ({ params }) => {
		const service = new CRMService();
		try {
			await service.createInvoiceFromOrder(params.id);
			// Redirect to the newly created invoice (assuming we have a route for it)
			// Or just stay here and show success.
			// Let's redirect to the invoice detail page if known, or list.
			// Assuming invoice detail is /panel/finance/invoices/[id] or similar.
			// Since we don't know the exact route structure for finance detail yet (step 607 showed invoice module but not route),
			// let's redirect to invoice list for now unless we are sure.
			// Actually, `createInvoiceFromOrder` returns the invoice object.

			// To be safe, redirect to invoice list or stay with message.
			// Let's stay and maybe flash message?
			// "Invoice Created".

			// If I want to be cool, I redirect to the invoice.
			// InvoiceService.getWithDetails returns the invoice.
			// Let's try redirecting to `/panel/finance/invoices/${invoice.id}` if it exists.
			// I'll stick to a success return for now.
			return { success: true, message: m.msg_success_invoice_created() };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to create invoice' });
		}
	},
	confirm: async ({ params }) => {
		const service = new CRMService();
		await service.confirmOrder(params.id);
		return { success: true };
	},

	createProject: async ({ params, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');
		const service = new CRMService();
		try {
			const project = await service.createProjectFromOrder(params.id, locals.user.id);
			return {
				success: true,
				message: m.msg_success_project_created(),
				projectId: project.id
			};
		} catch (e: unknown) {
			const err = e as Error;
			console.error(err);
			return fail(500, { message: err.message || 'Failed to create project' });
		}
	}
};
