import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { taskComments, users } from '$lib/server/database/schemas';
import { eq } from 'drizzle-orm';
import { broadcastEvent } from '$lib/server/sse';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request }) => {
	// const session = await locals.auth(); // Assuming auth logic
	// if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { id: taskId } = params;
	const { content } = await request.json();

	// Mock user ID for now if auth is not fully set up in this context
	const userId = 'user_123'; // Replace with session.user.id

	// Generate ID
	const commentId = crypto.randomUUID();

	await db.insert(taskComments).values({
		id: commentId,
		taskId: taskId!,
		userId: userId,
		content
	});

	// Fetch full comment with user details for response/broadcasting
	const [newComment] = await db
		.select({
			id: taskComments.id,
			content: taskComments.content,
			createdAt: taskComments.createdAt,
			taskId: taskComments.taskId,
			userId: taskComments.userId,
			user: {
				name: users.name,
				// Placeholder avatar since explicit field doesn't exist yet
				avatar: sql`NULL`.as('avatar')
			}
		})
		.from(taskComments)
		.leftJoin(users, eq(taskComments.userId, users.id))
		.where(eq(taskComments.id, commentId));

	// Broadcast event
	broadcastEvent('comment', newComment);

	return json(newComment);
};
