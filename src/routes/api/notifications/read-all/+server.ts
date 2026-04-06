import { NotificationModule } from '$lib/server/modules/notification/module';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const notificationService = NotificationModule.getService();
		await notificationService.markAllAsRead(locals.user.id);

		return json({ success: true, message: m.msg_notifications_read_all() });
	} catch (err) {
		console.error('Error marking all notifications as read:', err);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
