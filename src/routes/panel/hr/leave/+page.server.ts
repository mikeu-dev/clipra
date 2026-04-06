import { LeaveModule } from '$lib/server/modules/leave/module';
import * as m from '$lib/paraglide/messages.js';

import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema, type IdSchema } from '$lib/schemas/destroy';
import { leaveRequestSchema, type LeaveRequestSchema } from '$lib/schemas/leave-request';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const leaveService = LeaveModule.getService();

export const load: PageServerLoad = async (event) => {
	if (!event.locals.activeCompany) {
		throw redirect(302, '/panel/select-company');
	}

	const companyId = event.locals.activeCompany.id;
	const requests = await leaveService.findAllByCompanyId(companyId);

	return {
		requests,
		form: await superValidate(zod(leaveRequestSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: { message: m.msg_error_unauthorized() } });
		}

		const form: SuperValidated<Infer<LeaveRequestSchema>> = await superValidate(
			event,
			zod(leaveRequestSchema)
		);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await leaveService.create({
				userId: event.locals.user.id,
				type: form.data.type,
				startDate: new Date(form.data.startDate),
				endDate: new Date(form.data.endDate),
				reason: form.data.reason as string,
				status: 'pending'
			});
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_submit_leave_request() }
			});
		}
	},
	approve: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		try {
			await leaveService.approve(id, event.locals.user.id);
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { message: m.msg_error_failed_approve_request() });
		}
	},
	reject: async (event) => {
		if (!event.locals.user) return fail(401);
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		try {
			await leaveService.reject(id, event.locals.user.id);
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { message: m.msg_error_failed_reject_request() });
		}
	},
	destroy: async (event) => {
		const form: SuperValidated<Infer<IdSchema>> = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await leaveService.delete(form.data.id as string);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_leave_request() }
			});
		}
	}
} satisfies Actions;
