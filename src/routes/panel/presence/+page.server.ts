import { PresenceModule } from '$lib/server/modules/presence/module';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const presenceService = PresenceModule.getService();

export const load: PageServerLoad = async ({ url }) => {
	try {
		const page = Number(url.searchParams.get('page')) || 1;
		const limit = Number(url.searchParams.get('limit')) || 10;
		const search = url.searchParams.get('search') || undefined;
		const month = url.searchParams.get('month') ? Number(url.searchParams.get('month')) : undefined;
		const year = url.searchParams.get('year') ? Number(url.searchParams.get('year')) : undefined;

		const result = await presenceService.getPaginated(page, limit, {
			search,
			month,
			year
		});

		return {
			presences: result.data,
			count: result.total,
			page: result.page,
			limit: result.limit,
			totalPages: result.totalPages
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load presences');
	}
};
