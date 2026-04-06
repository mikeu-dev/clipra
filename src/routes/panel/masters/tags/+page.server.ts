import { TagModule } from '$lib/server/modules/tag/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { tagSchema, type TagSchema } from '$lib/schemas/tag';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

const tagService = TagModule.getService();

export const load: PageServerLoad = async () => {
	const tags = await tagService.getAll();

	return {
		tags,
		form: await superValidate(zod(tagSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		const form: SuperValidated<Infer<TagSchema>> = await superValidate(event, zod(tagSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await tagService.create({
				name: form.data.name
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_tag() }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<TagSchema>> = await superValidate(event, zod(tagSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await tagService.update(id, {
				name: form.data.name
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_tag() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await tagService.delete(form.data.id);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_tag() }
			});
		}
	}
} satisfies Actions;
