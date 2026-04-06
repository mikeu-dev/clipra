import { SalaryComponentModule } from '$lib/server/modules/salary-component/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { salaryComponentSchema, type SalaryComponentSchema } from '$lib/schemas/salary-component';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const salaryComponentService = SalaryComponentModule.getService();

export const load: PageServerLoad = async (event) => {
	if (!event.locals.activeCompany) {
		throw redirect(302, '/panel/select-company');
	}

	const companyId = event.locals.activeCompany.id;
	const components = await salaryComponentService.findAllByCompanyId(companyId);

	return {
		components,
		form: await superValidate(zod(salaryComponentSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		if (!event.locals.activeCompany) {
			return fail(401, { error: { message: m.msg_error_unauthorized() } });
		}

		const form: SuperValidated<Infer<SalaryComponentSchema>> = await superValidate(
			event,
			zod(salaryComponentSchema)
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await salaryComponentService.create({
				companyId: event.locals.activeCompany.id,
				name: form.data.name,
				type: form.data.type,
				calculationType: form.data.calculationType,
				defaultAmount: form.data.defaultAmount,
				isActive: form.data.isActive
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_salary_component() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await salaryComponentService.delete(form.data.id as string);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_salary_component() }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<SalaryComponentSchema>> = await superValidate(
			event,
			zod(salaryComponentSchema)
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await salaryComponentService.update(id, {
				name: form.data.name,
				type: form.data.type,
				calculationType: form.data.calculationType,
				defaultAmount: form.data.defaultAmount,
				isActive: form.data.isActive
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_salary_component() }
			});
		}
	}
} satisfies Actions;
