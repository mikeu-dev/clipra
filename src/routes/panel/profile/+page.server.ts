import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = requireLogin(event);
	return { user };
};

// Memeriksa apakah user sudah login
function requireLogin(event: Parameters<PageServerLoad>[0]) {
	if (!event.locals.user) {
		throw redirect(302, '/auth/login');
	}

	return event.locals.user;
}
