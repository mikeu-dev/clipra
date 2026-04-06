import { fail, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import type { Actions, PageServerLoad } from './$types';
import { TimesheetController } from '$lib/server/modules/timesheet/controller';
import { ProjectController } from '$lib/server/modules/project/controller';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const projectController = new ProjectController();
	return {
		// In a real app, maybe only show projects assigned to user
		projects: await projectController.index()
	};
};

export const actions: Actions = {
	logTime: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const formData = await request.formData();
		const projectId = formData.get('projectId') as string;
		const taskId = formData.get('taskId') as string;
		const description = formData.get('description') as string;
		const hours = formData.get('hours') as string;
		const date = formData.get('date') as string;

		if (!projectId || !hours || !date) {
			return fail(400, { missing: true });
		}

		try {
			const controller = new TimesheetController();
			await controller.create({
				userId: locals.user.id,
				projectId,
				taskId: taskId || null,
				description,
				hours,
				date: new Date(date),
				status: 'draft'
			});
		} catch (error) {
			console.error(error);
			return fail(500, { message: m.msg_error_failed_log_time() });
		}

		throw redirect(303, '/panel/hr/timesheets');
	}
};
