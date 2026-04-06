import { AccountingService } from '$lib/server/modules/accounting/service';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod'; // Zod for schema

// Schema for Journal Entry with Items
// Limitation: Zod + Superforms can handle arrays, but simplified handling for MVP might just be stringified JSON for items if dynamic row adding is complex in Svelte 5 + Superforms v2 without array proxy magic setup correctly yet.
// Let's try to do it properly with array schema if possible, or fallback to processing raw request data for items.
// Given Svelte 5 and potential complexity, let's use a "items" array in schema.

const journalEntrySchema = z.object({
	date: z.string(), // Date input returns string YYYY-MM-DD
	reference: z.string().optional(),
	items: z
		.array(
			z.object({
				accountId: z.string().min(1, 'Account required'),
				description: z.string().min(1, 'Description required'),
				debit: z.number().min(0).default(0),
				credit: z.number().min(0).default(0)
			})
		)
		.min(2, 'At least 2 lines required for double entry')
		.refine(
			(items) => {
				const debit = items.reduce((sum, i) => sum + i.debit, 0);
				const credit = items.reduce((sum, i) => sum + i.credit, 0);
				return Math.abs(debit - credit) < 0.01;
			},
			{ message: m.msg_error_debit_credit_balance() }
		)
});

export const load: PageServerLoad = async ({ locals }) => {
	// We need accounts for the dropdown in the line items
	const service = new AccountingService();
	const companyId = locals.activeCompany?.id;
	if (!companyId) throw redirect(303, '/panel');

	const accounts = await service.getAccounts(companyId);

	// Initial form with 2 empty lines
	const form = await superValidate(
		{
			items: [
				{ accountId: '', description: '', debit: 0, credit: 0 },
				{ accountId: '', description: '', debit: 0, credit: 0 }
			]
		},
		zod(journalEntrySchema),
		{ errors: false }
	);

	return { form, accounts };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(journalEntrySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new AccountingService();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			const entryDate = new Date(form.data.date);
			await service.createEntry(
				{
					companyId,
					date: entryDate,
					number: `JRN-${Date.now()}`,
					reference: form.data.reference,
					state: 'posted', // Auto-post for now
					journalId: '' // Optional or need to select journal? Schema allows null.
				},
				form.data.items.map((item) => ({
					accountId: item.accountId,
					description: item.description,
					debit: item.debit.toString(),
					credit: item.credit.toString(),
					companyId,
					date: entryDate
				}))
			);
		} catch (e: unknown) {
			console.error(e);
			// Return error message (e.g. Unbalanced if service check fails, though Zod should catch it)
			return fail(500, {
				form,
				message: (e as Error).message || 'Failed to create journal entry.'
			});
		}

		throw redirect(303, '/panel/accounting/journals');
	}
};
