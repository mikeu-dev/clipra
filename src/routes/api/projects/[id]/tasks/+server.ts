import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Basic auth check
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const projectId = params.id;
	const { db } = await import('$lib/server/database');
	const { tasks } = await import('$lib/server/database/schemas');
	const { eq } = await import('drizzle-orm');

	const projectTasks = await db
		.select({
			id: tasks.id,
			title: tasks.title
		})
		.from(tasks)
		.where(eq(tasks.projectId, projectId));

	return json(projectTasks);
};
