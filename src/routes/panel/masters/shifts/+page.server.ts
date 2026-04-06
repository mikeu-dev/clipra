import { ShiftModule } from '$lib/server/modules/shift/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema, type IdSchema } from '$lib/schemas/destroy';
import { shiftSchema, type ShiftSchema } from '$lib/schemas/shift';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const shiftService = ShiftModule.getService();

export const load: PageServerLoad = async (event) => {
	if (!event.locals.activeCompany) {
		throw redirect(302, '/panel/select-company');
	}

	const companyId = event.locals.activeCompany.id;
	const shifts = await shiftService.findAllByCompanyId(companyId);

	return {
		shifts,
		form: await superValidate(zod(shiftSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		if (!event.locals.activeCompany) {
			return fail(401, { error: { message: m.msg_error_unauthorized() } });
		}

		const form: SuperValidated<Infer<ShiftSchema>> = await superValidate(event, zod(shiftSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await shiftService.create({
				companyId: event.locals.activeCompany.id,
				name: form.data.name
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_shift() }
			});
		}
	},
	destroy: async (event) => {
		const form: SuperValidated<Infer<IdSchema>> = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await shiftService.delete(form.data.id as string);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_shift() }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<ShiftSchema>> = await superValidate(event, zod(shiftSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await shiftService.update(id, {
				name: form.data.name
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_shift() }
			});
		}
	}
} satisfies Actions;
