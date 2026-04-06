import { PurchaseService } from '$lib/server/modules/purchase/service';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/database';
import { clients } from '$lib/server/database/schemas/clients';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const service = new PurchaseService();
	const requisition = await service.getRequisition(params.id);
	const companyId = locals.activeCompany?.id;

	if (!requisition) {
		throw redirect(303, '/panel/purchase/requisitions');
	}

	// For conversion, we need a list of suppliers
	const suppliers = companyId
		? await db.select().from(clients).where(eq(clients.companyId, companyId))
		: [];

	return { requisition, suppliers };
};

export const actions: Actions = {
	approve: async ({ params, locals }) => {
		const service = new PurchaseService();
		const userId = locals.user?.id;
		if (!userId) return fail(401, { message: m.msg_error_unauthorized() });

		try {
			await service.approveRequisition(params.id, userId);
			return { success: true, message: m.msg_success_requisition_approved() };
		} catch (e) {
			console.error(e);
			return fail(500, { message: m.msg_error_failed_approve_requisition() });
		}
	},
	reject: async ({ params }) => {
		const service = new PurchaseService();
		try {
			await service.rejectRequisition(params.id);
			return { success: true, message: m.msg_success_requisition_rejected() };
		} catch (e) {
			console.error(e);
			return fail(500, { message: m.msg_error_failed_reject_requisition() });
		}
	},
	convertToPO: async ({ params, request }) => {
		const service = new PurchaseService();
		const data = await request.formData();
		const supplierId = data.get('supplierId') as string;

		if (!supplierId) return fail(400, { message: 'Supplier is required' });

		try {
			const result = await service.convertToPurchaseOrder(params.id, supplierId);
			throw redirect(303, `/panel/purchase/orders/${result.order.id}`);
		} catch (e) {
			if (e instanceof Error && e.message === 'redirect') throw e;
			console.error(e);
			return fail(500, { message: m.msg_error_failed_convert_to_po() });
		}
	}
};
