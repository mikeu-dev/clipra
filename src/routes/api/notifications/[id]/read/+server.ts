import { NotificationModule } from '$lib/server/modules/notification/module';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	if (!id) {
		return json({ message: 'Missing notification ID' }, { status: 400 });
	}

	try {
		const notificationService = NotificationModule.getService();

		await notificationService.update(id, { readAt: new Date() });

		return json({ success: true, message: m.msg_notifications_read() });
	} catch (err) {
		console.error('Error marking notification as read:', err);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
