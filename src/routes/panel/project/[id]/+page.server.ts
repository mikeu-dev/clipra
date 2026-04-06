import { ProjectModule } from '$lib/server/modules/project/module';
import * as m from '$lib/paraglide/messages.js';

import { TaskModule } from '$lib/server/modules/task/module';
import { projectColumnService } from '$lib/server/modules/project-column/module';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { error, redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { taskSchema } from '$lib/schemas/task';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const projectId = params.id;
	const projectService = ProjectModule.getService();

	const project = await projectService.getProjectById(projectId);

	if (!project) {
		throw error(404, 'Proyek tidak ditemukan');
	}

	// Permission Check
	const roleName = locals.user.role?.name || '';
	const userId = locals.user.id;
	const isAdmin = ['admin', 'manager', 'director'].some((r) => roleName.toLowerCase().includes(r));
	const isMember = project.projectUsers.some(
		(pu: { user: { id: string } }) => pu.user.id === userId
	);

	if (!isAdmin && !isMember) {
		throw error(403, 'Anda bukan anggota dari portofolio ini');
	}

	// Load atau seed default columns
	let columns = await projectColumnService.getByProject(projectId);
	if (columns.length === 0) {
		await projectColumnService.seedDefaultColumns(projectId);
		columns = await projectColumnService.getByProject(projectId);
	}

	return {
		project,
		columns,
		taskForm: await superValidate(zod(taskSchema), { id: 'taskForm' })
	};
};

export const actions: Actions = {
	createTask: async (event) => {
		const form = await superValidate(event, zod(taskSchema));

		if (!form.valid) {
			return fail(400, { taskForm: form });
		}

		const taskService = TaskModule.getService();

		try {
			const task = await taskService.create({
				...form.data,
				deadline: form.data.deadline ? new Date(form.data.deadline) : null
			});

			// Log activity
			if (task && event.locals.user) {
				const { taskActivityService } = await import('$lib/server/modules/task/activity-service');
				await taskActivityService.logActivity({
					taskId: task.id,
					userId: event.locals.user.id,
					type: 'create',
					data: JSON.stringify(task)
				});
			}

			return { taskForm: form };
		} catch (e) {
			return fail(500, { taskForm: form, error: (e as Error).message });
		}
	},

	updateTask: async (event) => {
		const form = await superValidate(event, zod(taskSchema));

		if (!form.valid) {
			return fail(400, { taskForm: form });
		}

		if (!form.data.id) {
			return fail(400, { taskForm: form, error: 'Task ID is required for update' });
		}

		const taskService = TaskModule.getService();
		try {
			await taskService.update(form.data.id, {
				...form.data,
				id: undefined,
				deadline: form.data.deadline ? new Date(form.data.deadline) : null
			});

			// Log activity
			if (event.locals.user) {
				const { taskActivityService } = await import('$lib/server/modules/task/activity-service');
				await taskActivityService.logActivity({
					taskId: form.data.id,
					userId: event.locals.user.id,
					type: 'update',
					data: JSON.stringify(form.data)
				});
			}

			return { taskForm: form };
		} catch (e) {
			return fail(500, { taskForm: form, error: (e as Error).message });
		}
	},

	deleteTask: async ({ request, locals }) => {
		const data = await request.formData();
		const taskId = data.get('taskId') as string;

		if (!taskId) return fail(400, { message: 'Task ID is required' });

		const taskService = TaskModule.getService();
		try {
			await taskService.delete(taskId);

			// Log activity
			if (locals.user) {
				const { taskActivityService } = await import('$lib/server/modules/task/activity-service');
				await taskActivityService.logActivity({
					taskId: taskId,
					userId: locals.user.id,
					type: 'delete',
					data: JSON.stringify({ id: taskId })
				});
			}

			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	},

	updateTaskColumn: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const taskId = data.get('taskId') as string;
		const columnId = data.get('columnId') as string;

		if (!taskId || !columnId) {
			return fail(400, { message: m.msg_error_missing_task_id_column_id() });
		}

		const taskService = TaskModule.getService();
		try {
			// Log activity sebelum update
			const { taskActivityService } = await import('$lib/server/modules/task/activity-service');
			const task = await taskService.getById(taskId);

			await taskService.updateColumn(taskId, columnId);
			const updatedTask = await taskService.getById(taskId);

			if (task && locals.user) {
				await taskActivityService.logActivity({
					taskId: taskId,
					userId: locals.user.id,
					type: 'move',
					data: JSON.stringify({
						fromColumn: task?.columnId,
						toColumn: columnId
					})
				});
			}

			// Real-time Broadcast
			const { notificationService } = await import('$lib/server/notifications');
			notificationService.broadcastTaskUpdate(
				(updatedTask as { projectId: string }).projectId,
				updatedTask
			);

			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	},

	reorderTasks: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const columnId = data.get('columnId') as string;
		const taskIds = JSON.parse(data.get('taskIds') as string);

		if (!columnId || !taskIds) {
			return fail(400, { message: m.msg_error_missing_column_id_task_id() });
		}

		const taskService = TaskModule.getService();
		try {
			await taskService.reorderInColumn(columnId, taskIds);
			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	},

	// Column management actions
	createColumn: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const projectId = data.get('projectId') as string;
		const name = data.get('name') as string;
		const color = (data.get('color') as string) || '#6B7280';

		if (!projectId || !name) {
			return fail(400, { message: m.msg_error_missing_project_id_name() });
		}

		try {
			const existingColumns = await projectColumnService.getByProject(projectId);
			await projectColumnService.create({
				projectId,
				name,
				color,
				position: existingColumns.length
			});
			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	},

	updateColumn: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const columnId = data.get('columnId') as string;
		const name = data.get('name') as string;
		const color = data.get('color') as string;
		const wipLimit = data.get('wipLimit');

		if (!columnId) {
			return fail(400, { message: m.msg_error_missing_column_id() });
		}

		try {
			await projectColumnService.update(columnId, {
				...(name && { name }),
				...(color && { color }),
				...(wipLimit !== null && { wipLimit: wipLimit ? parseInt(wipLimit as string) : null })
			});
			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	},

	deleteColumn: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const data = await request.formData();
		const columnId = data.get('columnId') as string;

		if (!columnId) return fail(400, { message: 'Column ID is required' });

		try {
			await projectColumnService.delete(columnId);
			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	}
};
