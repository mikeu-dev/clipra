// Deskripsi: Halaman ini digunakan untuk mengelola layout server pada panel admin.
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { useInitials } from '$lib/utils/useInitials';
import { ProjectService } from '$lib/server/modules/project/service';

export const load: LayoutServerLoad = async (event) => {
	const user = requireLogin(event);
	const ak = useInitials(user.name);
	const avatar = '/images/avatar/a-sm.jpg';

	const projectService = new ProjectService();
	const projects = await projectService.getPaginatedProjects(
		1,
		100,
		undefined,
		user.id,
		user.role?.name || '',
		undefined,
		event.locals.activeCompany?.id
	);

	// Fetch companies for the user
	const { db } = await import('$lib/server/database');
	const { employees, companies, users, roles } = await import('$lib/server/database/schemas');
	const { eq } = await import('drizzle-orm');

	// Fetch actual role for the user
	const currentUserRecord = await db
		.select({
			user: users,
			role: roles
		})
		.from(users)
		.leftJoin(roles, eq(users.roleId, roles.id))
		.where(eq(users.id, user.id));

	// Use regular join instead of relational query to avoid LATERAL JOIN (not supported by MariaDB)
	// Only select company columns to avoid missing DB columns in employees table
	const userEmployeesWithCompany = await db
		.select({
			company: companies
		})
		.from(employees)
		.leftJoin(companies, eq(employees.companyId, companies.id))
		.where(eq(employees.userId, user.id));

	const availableCompanies = userEmployeesWithCompany
		.map((e) => e.company)
		.filter((c) => c !== null);

	return {
		user: { ...user, ak, avatar, role: currentUserRecord[0]?.role },
		sessionUser: { ...user, ak, avatar, role: currentUserRecord[0]?.role },
		permissions: event.locals.permissions,
		projects: projects.data,
		activeCompany: event.locals.activeCompany,
		availableCompanies
	};
};

// Memeriksa apakah user sudah login
function requireLogin(event: Parameters<LayoutServerLoad>[0]) {
	if (!event.locals.user) {
		throw redirect(302, '/auth/login');
	}

	return event.locals.user;
}
