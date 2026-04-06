import { AccountingService } from '$lib/server/modules/accounting/service';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

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

export const load: PageServerLoad = async ({ params }) => {
	const service = new AccountingService();
	const account = await service.getAccount(params.id);

	if (!account) {
		throw redirect(303, '/panel/accounting/accounts');
	}

	const form = await superValidate(
		{
			...account,
			description: account.description || undefined,
			reconcile: account.reconcile || false
		},
		zod(accountSchema)
	);
	return { form, account };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(accountSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new AccountingService();
		await service.updateAccount(params.id, form.data);

		throw redirect(303, '/panel/accounting/accounts');
	}
};
