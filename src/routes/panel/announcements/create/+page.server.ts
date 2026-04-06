import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { announcementFormSchema } from '$lib/schemas/announcement/form';
import { AnnouncementModule } from '$lib/server/modules/announcement/module';
import { AttachmentModule } from '$lib/server/modules/attachment/module';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { roles, users } from '$lib/server/database/schemas';
import { isNull } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/auth/login');
	if (!locals.permissions?.includes('announcements.create')) {
		throw redirect(302, '/panel/announcements');
	}

	const form = await superValidate(zod(announcementFormSchema));

	// Get roles for target picker
	const allRoles = await db.select({ id: roles.id, name: roles.name }).from(roles);

	// Get users for target picker
	const allUsers = await db
		.select({ id: users.id, name: users.name, email: users.email })
		.from(users)
		.where(isNull(users.deletedAt));

	return { form, roles: allRoles, users: allUsers };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(announcementFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) {
			return fail(401, { form });
		}

		if (!event.locals.permissions?.includes('announcements.create')) {
			return fail(403, { message: m.error_access_denied() });
		}

		try {
			const announcementService = AnnouncementModule.getService();

			// Parse target value
			let targetValue: string[] | null = null;
			if (form.data.targetType !== 'all' && form.data.targetValue) {
				try {
					targetValue = JSON.parse(form.data.targetValue);
				} catch {
					targetValue = form.data.targetValue
						.split(',')
						.map((v: string) => v.trim())
						.filter(Boolean);
				}
			}

			const created = await announcementService.create({
				createdBy: event.locals.user.id,
				title: form.data.title,
				content: form.data.content,
				priority: form.data.priority,
				targetType: form.data.targetType,
				targetValue,
				status: form.data.status,
				expiresAt: form.data.expiresAt ? new Date(form.data.expiresAt) : null
			});

			const announcementId = (created as { id: string }).id;

			// Handle file attachments - move from tmp to uploads
			const attachmentFiles = formData.getAll('attachments') as string[];
			if (attachmentFiles.length > 0) {
				const fs = await import('node:fs');
				const path = await import('node:path');
				const cwd = process.cwd();
				const attachmentService = AttachmentModule.getService();

				for (const fileName of attachmentFiles) {
					if (!fileName || typeof fileName !== 'string') continue;
					const tmpPath = path.join(cwd, 'static/tmp', fileName);
					const uploadDir = path.join(cwd, 'static/uploads/announcements');

					if (fs.existsSync(tmpPath)) {
						if (!fs.existsSync(uploadDir)) {
							fs.mkdirSync(uploadDir, { recursive: true });
						}
						const finalPath = path.join(uploadDir, fileName);
						fs.renameSync(tmpPath, finalPath);

						await attachmentService.create({
							ownerId: announcementId,
							ownerType: 'announcement',
							docName: fileName,
							url: `/uploads/announcements/${fileName}`,
							isPublic: false
						});
					}
				}
			}

			// Auto-publish if status is 'published'
			if (form.data.status === 'published') {
				if (event.locals.permissions?.includes('announcements.publish')) {
					await announcementService.publish(announcementId);
				}
			}
		} catch (e) {
			console.error('Error creating announcement:', e);
			return fail(500, { form, error: { message: m.msg_error_create_announcement() } });
		}

		throw redirect(303, '/panel/announcements');
	}
};
