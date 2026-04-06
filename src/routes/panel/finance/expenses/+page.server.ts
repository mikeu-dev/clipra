import { ExpenseController } from '$lib/server/modules/expense/controller';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const controller = new ExpenseController(locals.activeCompany?.id);
	const expenses = await controller.getAllWithDetails();
	return { expenses };
};
