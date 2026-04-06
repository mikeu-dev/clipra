import { TimesheetController } from '$lib/server/modules/timesheet/controller';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// TODO: Get user id from locals
	if (!locals.user) {
		return { timesheets: [] };
	}

	const controller = new TimesheetController(locals.activeCompany?.id);
	const timesheets = await controller.getByUserId(locals.user.id);
	return { timesheets };
};
