import { fail, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import type { Actions, PageServerLoad } from './$types';
import { ExpenseController } from '$lib/server/modules/expense/controller';
import { ProjectController } from '$lib/server/modules/project/controller';

export const load: PageServerLoad = async () => {
	const projectController = new ProjectController();
	return {
		projects: await projectController.index()
	};
};

export const actions: Actions = {
	createExpense: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const formData = await request.formData();
		const projectId = formData.get('projectId') as string;
		const category = formData.get('category') as string;
		const description = formData.get('description') as string;
		const amount = formData.get('amount') as string;
		const date = formData.get('date') as string;

		if (!projectId || !description || !amount || !date) {
			return fail(400, { missing: true });
		}

		try {
			const controller = new ExpenseController();
			await controller.create({
				userId: locals.user.id,
				projectId,
				category,
				description,
				amount,
				date: new Date(date),
				status: 'pending' // Default status
			});
		} catch (error) {
			console.error(error);
			return fail(500, { message: m.msg_error_failed_create_expense() });
		}

		throw redirect(303, '/panel/finance/expenses');
	}
};
