import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AnalyticsService } from '$lib/server/modules/analytics/service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET: RequestHandler = async ({ url }: any) => {
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');

	const financial =
		!start || !end
			? await AnalyticsService.getFinancialStats(
					new Date(new Date().getFullYear(), new Date().getMonth(), 1),
					new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
				)
			: await AnalyticsService.getFinancialStats(new Date(start), new Date(end));

	const projects = await AnalyticsService.getProjectStats();

	return json({ ...financial, projects });
};
