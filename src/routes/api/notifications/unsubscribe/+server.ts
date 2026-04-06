import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { pushSubscriptions } from '$lib/server/database/schemas';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { endpoint } = await request.json();

		if (!endpoint) {
			return json({ error: 'Endpoint required' }, { status: 400 });
		}

		await db
			.delete(pushSubscriptions)
			.where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)));

		return json({ success: true });
	} catch (error) {
		console.error('Error removing subscription:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
