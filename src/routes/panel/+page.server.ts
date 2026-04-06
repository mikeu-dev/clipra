import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SessionController } from '$lib/server/modules/session/controller';
import { DashboardModule } from '$lib/server/modules/dashboard/module';

const sessionController = new SessionController();

export const load: PageServerLoad = async (event) => {
	// Validasi token dari cookie
	const { session, user } = await sessionController.validate(event);

	if (!session || !user) {
		throw redirect(302, '/auth/login');
	}

	const companyId = event.locals.activeCompany?.id;

	const dashboardService = DashboardModule.getService();

	const stats = await dashboardService.getComproStats(companyId);
	const recentActivities = (await dashboardService.getRecentActivities(5, companyId)).map(
		(activity) => ({
			...activity,
			entityType: activity.entityType ?? undefined,
			user: {
				...activity.user,
				name: activity.user.name ?? undefined
			}
		})
	);
	const projectStatusStats = await dashboardService.getProjectStatusStats(companyId);
	const financialSummary = await dashboardService.getFinancialSummary(companyId);
	const revenueTrends = await dashboardService.getRevenueTrends(6, companyId);
	const projectProfitability = await dashboardService.getProjectProfitability(5, companyId);

	return {
		user,
		stats,
		financialSummary,
		recentActivities,
		charts: {
			projectStatus: projectStatusStats,
			revenueTrends
		},
		projectProfitability
	};
};

export const actions: Actions = {
	logout: async (event) => {
		// Validasi token sebelum logout
		const { session } = await sessionController.validate(event);
		if (!session) {
			return fail(401, { message: 'Tidak ada sesi aktif' });
		}

		// Hapus session di database & cookie
		await sessionController.destroy(event);

		// Redirect ke halaman login
		throw redirect(302, '/auth/login');
	}
};
