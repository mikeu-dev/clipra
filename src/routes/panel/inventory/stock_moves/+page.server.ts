import { InventoryService } from '$lib/server/modules/inventory/service';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const service = new InventoryService();
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		throw error(400, 'Active company not found');
	}

	try {
		const moves = await service.getStockMoves(companyId);
		return {
			moves
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load stock moves');
	}
};
