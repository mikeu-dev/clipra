import { UnitModule } from '$lib/server/modules/unit/module';
import * as m from '$lib/paraglide/messages.js';

import { UserModule } from '$lib/server/modules/user/module';
import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { unitSchema, type UnitSchema } from '$lib/schemas/unit';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

const unitService = UnitModule.getService();
const userService = UserModule.getService();

export const load: PageServerLoad = async () => {
	const units = await unitService.findAllWithUser();
	const usersArr = await userService.getAll();

	return {
		units,
		users: usersArr,
		form: await superValidate(zod(unitSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		const form: SuperValidated<Infer<UnitSchema>> = await superValidate(event, zod(unitSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await unitService.create({
				name: form.data.name,
				userId: form.data.userId
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_unit() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await unitService.delete(form.data.id);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_unit() }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<UnitSchema>> = await superValidate(event, zod(unitSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await unitService.update(id, {
				name: form.data.name,
				userId: form.data.userId
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_unit() }
			});
		}
	}
} satisfies Actions;
