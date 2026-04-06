import { NotificationModule } from '$lib/server/modules/notification/module';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ notifications: [] }, { status: 401 });
	}

	const controller = NotificationModule.getController();
	const notifications = await controller.getUserNotifications(locals.user.id);

	return json({ notifications });
};
