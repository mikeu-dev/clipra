import { ClientModule } from '$lib/server/modules/client/module';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const { clientId } = params;
	if (!clientId) {
		throw error(404, 'Client not found');
	}

	try {
		const clientService = ClientModule.getService();
		const client = await clientService.getById(clientId);

		return {
			client
		};
	} catch (e) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		throw error(404, (e as any).message || 'Client not found');
	}
};
