import { CareerModule } from '$lib/server/modules/career/module';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const search = url.searchParams.get('search') || undefined;

	const careerService = CareerModule.getService();
	// Only fetch published jobs for public view
	const { data: jobs, total } = await careerService.getPaginated(page, 9, search, 'published');

	return {
		jobs,
		total,
		page
	};
};
