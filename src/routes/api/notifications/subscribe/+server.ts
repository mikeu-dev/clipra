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
		const subscription = await request.json();

		if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
			return json({ error: 'Invalid subscription data' }, { status: 400 });
		}

		// Check if subscription already exists
		const existing = await db.query.pushSubscriptions.findFirst({
			where: and(
				eq(pushSubscriptions.userId, user.id),
				eq(pushSubscriptions.endpoint, subscription.endpoint)
			)
		});

		if (existing) {
			// Update if needed
			await db
				.update(pushSubscriptions)
				.set({
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth,
					updatedAt: new Date(),
					isActive: true
				})
				.where(eq(pushSubscriptions.id, existing.id));
		} else {
			// Create new
			await db.insert(pushSubscriptions).values({
				userId: user.id,
				endpoint: subscription.endpoint,
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userAgent: request.headers.get('user-agent'),
				isActive: true
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving subscription:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
