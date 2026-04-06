import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Placeholder for settings load logic
	return {
		user: locals.user
	};
};
