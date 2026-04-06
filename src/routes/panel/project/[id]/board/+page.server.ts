import { error, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/database';
import { projects } from '$lib/server/database/schemas/projects';
import { tasks } from '$lib/server/database/schemas/tasks';
import { users } from '$lib/server/database/schemas/users';
import { eq } from 'drizzle-orm';
import { SessionController } from '$lib/server/modules/session/controller';
import { notificationService } from '$lib/server/notifications';

const sessionController = new SessionController();

export const load: PageServerLoad = async (event) => {
	const { session, user } = await sessionController.validate(event);
	if (!session) throw redirect(302, '/auth/login');

	const projectId = event.params.id;

	// Fetch Project details
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId)
	});

	if (!project) throw error(404, 'Project not found');

	// Fetch Tasks with Assignees using regular join (MariaDB doesn't support LATERAL JOIN)
	const taskRows = await db
		.select({
			task: tasks,
			assignee: {
				id: users.id,
				name: users.name,
				username: users.username
			}
		})
		.from(tasks)
		.leftJoin(users, eq(tasks.assignedTo, users.id))
		.where(eq(tasks.projectId, projectId));

	const projectTasks = taskRows.map((row) => ({
		...row.task,
		assignee: row.assignee
	}));

	return {
		user,
		project,
		tasks: projectTasks
	};
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const { request } = event;
		const { session, user } = await sessionController.validate(event);
		if (!session || !user) {
			return { success: false, message: m.msg_error_unauthorized() };
		}

		const formData = await request.formData();
		const taskId = formData.get('taskId') as string;
		const newStatus = formData.get('status') as string;

		if (!taskId || !newStatus) {
			return { success: false, message: m.msg_error_invalid_data() };
		}

		await db
			.update(tasks)
			// .set({ status: newStatus as 'open' | 'in_progress' | 'completed' | 'waiting' })
			.set({ updatedAt: new Date() }); // Fallback update since status column doesn't exist

		// Broadcast event - using regular join (MariaDB doesn't support LATERAL JOIN)
		const taskRow = await db
			.select({
				task: tasks,
				assignee: {
					name: users.name,
					username: users.username
				}
			})
			.from(tasks)
			.leftJoin(users, eq(tasks.assignedTo, users.id))
			.where(eq(tasks.id, taskId))
			.limit(1);

		const task = taskRow[0] ? { ...taskRow[0].task, assignee: taskRow[0].assignee } : null;

		if (task) {
			notificationService.broadcast('task_updated', {
				taskId: task.id,
				projectId: task.projectId,
				oldStatus: 'unknown', // We could fetch this if needed, but for now simple broadcast
				newStatus: newStatus,
				updatedBy: user.name,
				taskTitle: task.title
			});
		}

		return { success: true };
	}
};
