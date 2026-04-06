import { CRMService } from '$lib/server/modules/crm/service';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const leadSchema = z.object({
	name: z.string().min(1).max(255),
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

export const load: PageServerLoad = async ({ params }) => {
	const service = new CRMService();
	const lead = await service.getLead(params.id);

	if (!lead) {
		throw redirect(303, '/panel/crm/leads');
	}

	const form = await superValidate(
		{
			...lead,
			contactName: lead.contactName || '',
			email: lead.email || '',
			phone: lead.phone || '',
			type: lead.type || 'lead',
			stage: lead.stage || 'new',
			notes: lead.notes || '',
			expectedRevenue: Number(lead.expectedRevenue),
			probability: Number(lead.probability),
			priority: lead.priority || 'medium'
		},
		zod(leadSchema)
	);

	return { form, lead };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod(leadSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new CRMService();
		await service.updateLead(params.id, {
			...form.data,
			expectedRevenue: form.data.expectedRevenue.toString(),
			probability: form.data.probability.toString()
		});

		throw redirect(303, '/panel/crm/leads');
	}
};
