// src/routes/panel/log/+page.server.ts
import { ActivityLogModule } from '$lib/server/modules/activity-log/module';
import { superValidate } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

const logService = ActivityLogModule.getService();

export const load: PageServerLoad = async () => {
	const log = await logService.getAllActivityLogWithUser();

	return {
		log,
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
			await logService.delete(form.data.id);
			return {
				form,
				success: true
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.error_delete_log() }
			});
		}
	}
} satisfies Actions;
