import { fail, type Actions } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { HikvisionService } from '$lib/server/modules/hikvision/service';
import { generateId } from '$lib/utils/useUserId';

const deviceSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	ipAddress: z.string().min(1, 'IP Address is required'),
	port: z.number().default(80),
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async ({ locals }) => {
	const service = new HikvisionService(locals.activeCompany?.id);
	const devices = await service.getAllDevices();

	const form = await superValidate(zod(deviceSchema));

	return {
		devices,
		form
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await superValidate(request, zod(deviceSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!locals.activeCompany?.id) {
			return fail(401, { form, message: m.msg_error_no_active_company() });
		}

		const service = new HikvisionService(locals.activeCompany.id);

		try {
			await service.createDevice({
				id: generateId(),
				companyId: locals.activeCompany.id,
				...form.data,
				isActive: true
			});
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: m.msg_error_failed_create_device() });
		}

		return { form };
	},

	// Test connection action
	test: async () => {
		// ... to be implemented if needed
		return { success: true };
	}
};
