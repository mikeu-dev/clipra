import { CareerModule } from '$lib/server/modules/career/module';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const careerService = CareerModule.getService();
	const job = await careerService.getById(params.id);

	if (!job) {
		throw redirect(302, '/panel/career');
	}

	const applicants = await careerService.getApplicants(params.id);

	return {
		job,
		applicants
	};
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const status = data.get('status') as string;

		if (!id || !status) return fail(400, { message: 'Data tidak lengkap' });

		const careerService = CareerModule.getService();
		try {
			await careerService.updateApplicantStatus(id, status);
			return { success: true };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			return fail(500, { message: e.message });
		}
	}
};
