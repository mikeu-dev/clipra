// src/routes/panel/subscription/+page.server.ts
import { NewsletterModule } from '$lib/server/modules/newsletter/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

const newsletterService = NewsletterModule.getService();

export const load: PageServerLoad = async () => {
	const subscription = await newsletterService.getAll();

	return {
		subscription,
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: 'ID tidak valid' }
			});
		}

		try {
			await newsletterService.delete(form.data.id);
			return {
				form,
				success: true
			};
		} catch (e) {
			console.error(e);
			return fail(500, {
				form,
				error: { message: 'Terjadi kesalahan saat menghapus subscription.' }
			});
		}
	},

	broadcast: async ({ request }) => {
		const formData = await request.formData();
		const subject = formData.get('subject') as string;
		const content = formData.get('content') as string;

		if (!subject || !content) {
			return fail(400, {
				error: { message: m.msg_error_subject_content_required() }
			});
		}

		try {
			await newsletterService.sendBroadcast(subject, content);
			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, {
				error: { message: m.msg_error_failed_send_broadcast() }
			});
		}
	}
} satisfies Actions;
