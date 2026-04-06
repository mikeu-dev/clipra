import { ReportingService } from '$lib/server/modules/reporting/service';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const service = new ReportingService();
	const financialReport = await service.generateFinancialReport();

	// In production, maybe don't load everything on initial load if it's heavy
	const projectProfitability = await service.generateProjectProfitabilityReport();
	const payrollSummary = await service.generatePayrollSummary(); // Defaults to all time or current? logic in service handled default/empty
	const attendanceSummary = await service.generateAttendanceSummary();

	return {
		financialReport,
		projectProfitability,
		payrollSummary,
		attendanceSummary
	};
};
