// src/routes/panel/contact/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { ContactService } from '$lib/server/modules/contact/service';
import * as m from '$lib/paraglide/messages.js';
const contactService = new ContactService();

export const load: PageServerLoad = async () => {
	const contact = await contactService.getAll();

	return {
		contact,
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.error_invalid_id() }
			});
		}

		try {
			await contactService.delete(form.data.id);
			return {
				form,
				success: true
			};
		} catch (e: unknown) {
			console.error('[ERROR]', m.error_delete_contact(), e);
			return fail(500, {
				form,
				error: { message: m.error_delete_subscription() }
			});
		}
	}
} satisfies Actions;
