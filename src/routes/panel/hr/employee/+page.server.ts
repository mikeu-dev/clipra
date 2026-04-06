import { EmployeeModule } from '$lib/server/modules/employee/module';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	// const limit = Number(url.searchParams.get('limit')) || 10;
	// const search = url.searchParams.get('search') || undefined;

	const employeeService = EmployeeModule.getService(locals.activeCompany?.id);

	try {
		// Note: getAll from BaseService returns all. Pagination support requires custom method in service/repo if dataset is large.
		// For now, let's fetch all (assuming low volume) or use the pagination method if implemented.
		// User module implemented getPaginatedWithDetails.
		// EmployeeRepo just extends BaseRepo which has findAll.

		// TODO: Implement getPaginated in EmployeeService if needed.
		// For MVP, we'll fetch all and slice/filter in memory or just display all.
		// But better to stick to the pattern if possible.
		// Let's just getAll for now.

		const allEmployees = await employeeService.getAllWithDetails();

		return {
			allEmployees,
			countAllEmployees: allEmployees.length,
			currentPage: page
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load employees');
	}
};
