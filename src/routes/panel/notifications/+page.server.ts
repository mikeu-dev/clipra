import { fail, redirect } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

import type { Actions, PageServerLoad } from './$types';
import { NotificationModule } from '$lib/server/modules/notification/module';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 20;
	const typeFilter = url.searchParams.get('type') || undefined;

	const notificationService = NotificationModule.getService();
	const { data: notifications, total } = await notificationService.getPaginated(
		locals.user.id,
		page,
		limit,
		typeFilter
	);
	const unreadCount = await notificationService.getUnreadCount(locals.user.id);

	return {
		notifications,
		unreadCount,
		total,
		currentPage: page,
		limit,
		activeFilter: typeFilter || 'all'
	};
};

export const actions: Actions = {
	markAsRead: async (event) => {
		if (!event.locals.user) return fail(401);

		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { message: 'ID is required' });

		const notificationService = NotificationModule.getService();

		try {
			const notification = await notificationService.getById(id);
			if (!notification || notification.userId !== event.locals.user.id) {
				return fail(403, { message: 'Unauthorized action on this notification' });
			}
			await notificationService.update(id, { readAt: new Date() });
			return { success: true };
		} catch (error) {
			console.error('Error marking notification as read:', error);
			return fail(500, { message: m.msg_error_failed_mark_read() });
		}
	},
	markAllAsRead: async (event) => {
		if (!event.locals.user) return fail(401);

		const notificationService = NotificationModule.getService();

		try {
			await notificationService.markAllAsRead(event.locals.user.id);
			return { success: true };
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			return fail(500, { message: m.msg_error_failed_mark_all_read() });
		}
	},
	delete: async (event) => {
		if (!event.locals.user) return fail(401);

		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { message: 'ID is required' });

		const notificationService = NotificationModule.getService();

		try {
			const notification = await notificationService.getById(id);
			if (!notification || notification.userId !== event.locals.user.id) {
				return fail(403, { message: 'Unauthorized action on this notification' });
			}
			await notificationService.delete(id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting notification:', error);
			return fail(500, { message: m.msg_error_failed_delete_notification() });
		}
	}
};
