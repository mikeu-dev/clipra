import { AccountingRepository } from '$lib/server/modules/accounting/repository';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod'; // Using zod directly for schema definition
import { v4 as uuidv4 } from 'uuid';

// Define schema for form
const accountSchema = z.object({
	code: z.string().min(1, 'Code is required').max(20),
	name: z.string().min(1, 'Name is required').max(255),
	type: z.enum([
		'receivable',
		'payable',
		'liquidity',
		'current_assets',
		'bank',
		'cash',
		'assets',
		'liability',
		'equity',
		'income',
		'expense',
		'cost_of_revenue',
		'other_income',
		'other_expense'
	]),
	reconcile: z.boolean().default(false),
	description: z.string().optional()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(accountSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(accountSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const repo = new AccountingRepository();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			await repo.createAccount({
				id: uuidv4(),
				companyId,
				isActive: true, // Default
				...form.data
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: m.msg_error_failed_create_account() });
		}

		throw redirect(303, '/panel/accounting/accounts');
	}
};
