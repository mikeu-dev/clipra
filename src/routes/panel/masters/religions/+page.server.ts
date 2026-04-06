import { superValidate } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { religionSchema } from '$lib/schemas/religion';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { ReligionModule } from '$lib/server/modules/religion/module';

const religionService = ReligionModule.getService();

export const load: PageServerLoad = async () => {
	const religions = await religionService.getAll();

	return {
		religions,
		form: await superValidate(zod(religionSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(religionSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			await religionService.create({
				...form.data
				// id: generateId() // Removed manual ID generation
			});
			return {
				form,
				success: true
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_religion() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_invalid_id() }
			});
		}

		try {
			await religionService.delete(form.data.id);
			return {
				form,
				success: true
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_religion() }
			});
		}
	},
	update: async (event) => {
		const form = await superValidate(event, zod(religionSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await religionService.update(id, form.data);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_religion() }
			});
		}
	}
} satisfies Actions;
