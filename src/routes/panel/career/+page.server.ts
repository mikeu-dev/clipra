import { CareerModule } from '$lib/server/modules/career/module';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 9;
	const search = url.searchParams.get('search') || undefined;
	const status = (url.searchParams.get('status') as 'published' | 'draft' | 'closed') || undefined;

	const careerService = CareerModule.getService();

	const { data: jobs, total } = await careerService.getPaginated(page, limit, search, status);

	return {
		jobs,
		total,
		page,
		limit,
		userRole: locals.user.role?.name || ''
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID diperlukan' });

		const careerService = CareerModule.getService();
		try {
			await careerService.delete(id);
			return { success: true };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { message: e.message });
		}
	}
};
