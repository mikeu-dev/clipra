import { PurchaseService } from '$lib/server/modules/purchase/service';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const service = new PurchaseService();
	const order = await service.getOrder(params.id);

	if (!order) {
		throw redirect(303, '/panel/purchase/orders');
	}

	return { order };
};

export const actions: Actions = {
	confirm: async ({ params }) => {
		const service = new PurchaseService();
		await service.confirmOrder(params.id);
		return { success: true };
	},
	createBill: async ({ params }) => {
		const service = new PurchaseService();
		try {
			await service.createBill(params.id);
			return { success: true, message: m.msg_success_vendor_bill_created() };
		} catch (e) {
			console.error(e);
			return fail(500, { message: m.msg_error_failed_create_bill() });
		}
	},
	receiveProducts: async ({ params }) => {
		const service = new PurchaseService();
		try {
			await service.receiveProducts(params.id);
			return { success: true, message: m.msg_success_products_received() };
		} catch (e) {
			console.error(e);
			return fail(500, { message: m.msg_error_failed_receive_products() });
		}
	}
};
