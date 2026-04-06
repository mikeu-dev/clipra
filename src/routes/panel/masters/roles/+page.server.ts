import { superValidate } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { roleSchema } from '$lib/schemas/role';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { RoleModule } from '$lib/server/modules/role/module';
import { generateId } from '$lib/utils/useUserId';

const roleService = RoleModule.getService();

export const load: PageServerLoad = async () => {
	const roles = await roleService.getAllRoles();

	return {
		roles,
		form: await superValidate(zod(roleSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(roleSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			await roleService.createRole({
				...form.data,
				id: generateId()
			});
			return {
				form,
				success: true
			};
		} catch (e) {
			const message = (e as Error).message || 'Failed to create role';
			return fail(500, {
				form,
				error: { message }
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
			await roleService.deleteRole(form.data.id);
			return {
				form,
				success: true
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_role() }
			});
		}
	},
	update: async (event) => {
		const form = await superValidate(event, zod(roleSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await roleService.updateRole(id, form.data);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_role() }
			});
		}
	}
} satisfies Actions;
