import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { jobSchema } from '$lib/schemas/career';
import { CareerModule } from '$lib/server/modules/career/module';

import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	try {
		return {
			form: await superValidate(zod(jobSchema), { id: 'create-job-form' })
		};
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		console.error('[CAREER-CREATE-LOAD] Error initializing form:', e);
		return {
			form: await superValidate(zod(jobSchema), { id: 'create-job-form' }),
			error: message
		};
	}
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(jobSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log('Form data:', form.data);

		const careerService = CareerModule.getService();

		// Generate slug if empty
		if (!form.data.slug) {
			form.data.slug = form.data.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
		// Ensure unique slug (simple check, ideally should be robust)
		// For now let's hope it's unique or catch database error

		try {
			await careerService.create({
				...form.data,
				slug: form.data.slug!
			});
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { form, error: message });
		}

		throw redirect(303, '/panel/career');
	}
};
