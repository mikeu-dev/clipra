import { AnalyticsService } from '$lib/server/modules/analytics/service';
import { ReportingService } from '$lib/server/modules/reporting/service';
import type { RequestHandler } from './$types';
import * as m from '$lib/paraglide/messages.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET: RequestHandler = async ({ url }: any) => {
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');
	const type = url.searchParams.get('type') || 'financial'; // financial, projects

	const startDate = start
		? new Date(start)
		: new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	const endDate = end
		? new Date(end)
		: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

	if (type === 'financial') {
		const stats = await AnalyticsService.getFinancialStats(startDate, endDate);
		// Flatten for CSV: Date, Revenue, Expenses
		// Note: revenue and expenses arrays might have different dates indices
		// We need to merge them by date
		const dates = new Set([
			...stats.revenue.map((r) => r.date),
			...stats.expenses.map((e) => e.date)
		]);
		const sortedDates = Array.from(dates).sort();

		const csvData = sortedDates.map((date) => {
			const rev = stats.revenue.find((r) => r.date === date);
			const exp = stats.expenses.find((e) => e.date === date);
			return {
				date: new Date(date as unknown as string).toLocaleDateString(),
				revenue: rev ? rev.amount : 0,
				expense: exp ? exp.amount : 0,
				net: Number(rev?.amount || 0) - Number(exp?.amount || 0)
			};
		});

		const csv = ReportingService.generateCSV(csvData, [
			{ header: m.export_header_date(), key: 'date' },
			{ header: m.export_header_revenue(), key: 'revenue' },
			{ header: m.export_header_expenses(), key: 'expense' },
			{ header: m.export_header_net(), key: 'net' }
		]);

		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="financial_report_${startDate.toISOString().split('T')[0]}.csv"`
			}
		});
	}

	return new Response(m.export_invalid_type(), { status: 400 });
};
