import { PositionModule } from '$lib/server/modules/position/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { positionSchema, type PositionSchema } from '$lib/schemas/position';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const positionService = PositionModule.getService();

export const load: PageServerLoad = async (event) => {
	if (!event.locals.activeCompany) {
		throw redirect(302, '/panel/select-company');
	}

	const positions = await positionService.findAllByCompanyId(event.locals.activeCompany.id);

	return {
		positions,
		form: await superValidate(zod(positionSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		if (!event.locals.activeCompany) {
			return fail(401, { error: { message: m.msg_error_unauthorized() } });
		}

		const form: SuperValidated<Infer<PositionSchema>> = await superValidate(
			event,
			zod(positionSchema)
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await positionService.create({
				companyId: event.locals.activeCompany.id,
				name: form.data.name as string
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_position() }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<PositionSchema>> = await superValidate(
			event,
			zod(positionSchema)
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await positionService.update(id, {
				name: form.data.name as string
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_position() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await positionService.delete(form.data.id as string);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_position() }
			});
		}
	}
} satisfies Actions;
