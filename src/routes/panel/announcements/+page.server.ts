import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AnnouncementModule } from '$lib/server/modules/announcement/module';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(302, '/auth/login');

	if (!locals.permissions?.includes('announcements.view')) {
		throw redirect(302, '/panel');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 20;
	const statusFilter = url.searchParams.get('status') || undefined;

	const announcementService = AnnouncementModule.getService();
	const { data: announcements, total } = await announcementService.getPaginated(
		page,
		limit,
		statusFilter
	);

	return {
		announcements,
		total,
		currentPage: page,
		limit,
		activeFilter: statusFilter || 'all',
		permissions: locals.permissions
	};
};

export const actions: Actions = {
	publish: async (event) => {
		if (!event.locals.user) return fail(401);
		if (!event.locals.permissions?.includes('announcements.publish')) {
			return fail(403, { message: 'Tidak memiliki izin' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400, { message: 'ID diperlukan' });

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.publish(id);
			return { success: true };
		} catch (error) {
			console.error('Error publishing announcement:', error);
			return fail(500, { message: m.msg_error_publish_announcement() });
		}
	},
	archive: async (event) => {
		if (!event.locals.user) return fail(401);

		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400, { message: 'ID diperlukan' });

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.archive(id);
			return { success: true };
		} catch (error) {
			console.error('Error archiving announcement:', error);
			return fail(500, { message: m.msg_error_archive_announcement() });
		}
	},
	delete: async (event) => {
		if (!event.locals.user) return fail(401);
		if (!event.locals.permissions?.includes('announcements.delete')) {
			return fail(403, { message: 'Tidak memiliki izin' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		if (!id) return fail(400, { message: 'ID diperlukan' });

		const announcementService = AnnouncementModule.getService();
		try {
			await announcementService.delete(id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting announcement:', error);
			return fail(500, { message: m.msg_error_delete_announcement() });
		}
	}
};
