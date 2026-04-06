import { ClientModule } from '$lib/server/modules/client/module';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { clientSchema } from '$lib/schemas/client';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 9; // Grid of 9
	const search = url.searchParams.get('search') || undefined;

	const clientService = ClientModule.getService(locals.activeCompany?.id);

	const { data: clients, total } = await clientService.getPaginated(page, limit, search);

	return {
		clients,
		total,
		page,
		limit,
		userRole: locals.user.role?.name || '',
		form: await superValidate(zod(clientSchema))
	};
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.permissions?.includes('clients.create')) {
			return fail(403, { message: m.error_access_denied_create_client() });
		}

		const form = await superValidate(event, zod(clientSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const clientService = ClientModule.getService(event.locals.activeCompany?.id);

		try {
			await clientService.create({
				id: crypto.randomUUID(),
				...form.data,
				companyId: event.locals.activeCompany!.id // asserted by load or earlier check
			});

			return { form };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { form, error: e.message });
		}
	},

	update: async (event) => {
		if (!event.locals.permissions?.includes('clients.update')) {
			return fail(403, {
				message: m.error_access_denied_update_client()
			});
		}

		const form = await superValidate(event, zod(clientSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!form.data.id) {
			return fail(400, { form, error: 'Client ID diperlukan' });
		}

		const clientService = ClientModule.getService(event.locals.activeCompany?.id);

		try {
			await clientService.update(form.data.id, {
				name: form.data.name,
				contactEmail: form.data.contactEmail,
				phone: form.data.phone,
				latitude: form.data.latitude,
				longitude: form.data.longitude
			});

			return { form };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { form, error: e.message });
		}
	},

	delete: async (event) => {
		if (!event.locals.permissions?.includes('clients.delete')) {
			return fail(403, {
				message: m.error_access_denied_delete_client()
			});
		}

		const data = await event.request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID diperlukan' });

		const clientService = ClientModule.getService(event.locals.activeCompany?.id);
		try {
			await clientService.delete(id);
			return { success: true };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { message: e.message });
		}
	}
};
