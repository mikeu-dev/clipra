import { CRMRepository } from '$lib/server/modules/crm/repository';
import * as m from '$lib/paraglide/messages.js';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Define schema for form
const leadSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	contactName: z.string().optional(),
	email: z.string().email().optional().or(z.literal('')),
	phone: z.string().optional(),
	type: z.enum(['lead', 'opportunity']).default('lead'),
	stage: z.enum(['new', 'qualified', 'proposition', 'negotiation', 'won', 'lost']).default('new'),
	expectedRevenue: z.number().min(0).default(0),
	probability: z.number().min(0).max(100).default(0),
	priority: z.enum(['low', 'medium', 'high']).default('medium'),
	notes: z.string().optional()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(leadSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(leadSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const repo = new CRMRepository();
		const companyId = locals.activeCompany?.id;

		if (!companyId) {
			return fail(400, { form, message: m.msg_error_no_active_company() });
		}

		try {
			await repo.createLead({
				id: uuidv4(),
				companyId,
				...form.data,
				expectedRevenue: form.data.expectedRevenue.toString(),
				probability: form.data.probability.toString()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: m.msg_error_failed_create_lead() });
		}

		throw redirect(303, '/panel/crm/leads');
	}
};
