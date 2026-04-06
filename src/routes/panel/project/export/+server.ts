import { ReportingModule } from '$lib/server/modules/reporting/module';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const reportingService = ReportingModule.getService();
	const buffer = await reportingService.generateProjectReport();

	const data = new Uint8Array(buffer);

	return new Response(data, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="projects-report.xlsx"',
			'Content-Length': data.length.toString()
		}
	});
};
