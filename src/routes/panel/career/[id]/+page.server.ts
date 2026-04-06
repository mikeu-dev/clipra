import { superValidate } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { zod } from 'sveltekit-superforms/adapters';
import { jobSchema } from '$lib/schemas/career';
import { CareerModule } from '$lib/server/modules/career/module';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const careerService = CareerModule.getService();
	const job = await careerService.getById(params.id);

	if (!job) {
		throw redirect(302, '/panel/career');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const form = await superValidate(job as any, zod(jobSchema));

	return {
		form,
		job
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(jobSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!form.data.id) {
			return fail(400, { form, message: m.msg_error_id_missing() });
		}

		const careerService = CareerModule.getService();

		// Update slug if changed (maybe dangerous if indexed elsewhere but URL friendly)
		if (!form.data.slug) {
			form.data.slug = form.data.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}

		try {
			await careerService.update(form.data.id, form.data);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { form, error: e.message });
		}

		throw redirect(303, '/panel/career');
	}
};
