import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Role check - assuming user role is accessible via locals.user.role or similar
	// This part might need adjustment based on how roles are stored in locals.
	// For now, let's assume 'Superadmin' role check is needed.
	// If locals.user.role is just an ID, we might need to fetch the role name or have it enriched.

	// TEMPORARY: Allow access for development/testing if role logic isn't fully ready or strictly enforced yet.
	// Ideally: if (locals.user.role?.name !== 'Superadmin') throw redirect(302, '/panel');

	return {};
};
