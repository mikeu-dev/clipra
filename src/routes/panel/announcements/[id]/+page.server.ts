import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { AnnouncementModule } from '$lib/server/modules/announcement/module';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(302, '/auth/login');

	const announcementService = AnnouncementModule.getService();
	const detail = await announcementService.getDetailWithStats(params.id);

	if (!detail) {
		throw redirect(302, '/panel/announcements');
	}

	// Mark as read for the current user (if they are a recipient)
	try {
		await announcementService.markAsReadForUser(params.id, locals.user.id);
	} catch {
		// silently ignore if user is not a recipient
	}

	return {
		announcement: detail.announcement,
		attachments: detail.attachments,
		stats: detail.stats,
		permissions: locals.permissions
	};
};

export const actions: Actions = {
	publish: async (event) => {
		if (!event.locals.user) return fail(401);
		if (!event.locals.permissions?.includes('announcements.publish')) {
			return fail(403, { message: 'Tidak memiliki izin' });
		}

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.publish(event.params.id);
			return { success: true };
		} catch (error) {
			console.error('Error publishing announcement:', error);
			return fail(500, { message: m.msg_error_publish_announcement() });
		}
	},
	archive: async (event) => {
		if (!event.locals.user) return fail(401);
		if (!event.locals.permissions?.includes('announcements.publish')) {
			return fail(403, { message: 'Tidak memiliki izin' });
		}

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.archive(event.params.id);
			return { success: true };
		} catch (error) {
			console.error('Error archiving announcement:', error);
			return fail(500, { message: m.msg_error_archive_announcement() });
		}
	},
	broadcast: async (event) => {
		if (!event.locals.user) return fail(401);
		if (!event.locals.permissions?.includes('announcements.publish')) {
			return fail(403, { message: 'Tidak memiliki izin' });
		}

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.broadcast(event.params.id);
			return { success: true };
		} catch (error) {
			console.error('Error broadcasting announcement:', error);
			return fail(500, { message: m.msg_error_broadcast_announcement() });
		}
	}
};
