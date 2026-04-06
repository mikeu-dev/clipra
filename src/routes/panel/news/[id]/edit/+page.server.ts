import type { PageServerLoad, Actions } from './$types';
import * as m from '$lib/paraglide/messages.js';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/schemas/news/form';
import { NewsModule } from '$lib/server/modules/news/module';
import { fail, redirect, error } from '@sveltejs/kit';

const newsService = NewsModule.getService();

export const load: PageServerLoad = async ({ params }) => {
	let news;
	try {
		news = await newsService.getById(params.id);
	} catch {
		throw error(404, 'News not found');
	}

	const form = await superValidate(
		{
			title: news.title,
			slug: news.slug,
			content: news.content,
			published: news.published ?? false,
			thumbnail: news.thumbnail ?? undefined,
			type: news.type ?? undefined,
			tags: Array.isArray(news.tags)
				? news.tags.join(', ')
				: typeof news.tags === 'string'
					? news.tags
					: ''
		},
		zod(formSchema)
	);
	return { form, news };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) {
			return fail(401, { form, error: { message: m.msg_error_unauthorized() } });
		}

		// Security Check: Enforce Update Permission
		if (!event.locals.permissions?.includes('news.update')) {
			return fail(403, {
				message: m.error_access_denied_edit_news()
			});
		}

		// Internship / Reviewer Draft-Force Logic
		// If the user does not explicitly hold 'news.publish' capability, force the article to remain a draft.
		if (!event.locals.permissions?.includes('news.publish')) {
			form.data.published = false;
		}

		try {
			// Handle Thumbnail Move
			if (form.data.thumbnail && !form.data.thumbnail.startsWith('/uploads/')) {
				const fs = await import('node:fs');
				const path = await import('node:path');
				const cwd = process.cwd();
				const tmpPath = path.join(cwd, 'static/tmp', form.data.thumbnail);
				const uploadPath = path.join(cwd, 'static/uploads/news');

				if (fs.existsSync(tmpPath)) {
					if (!fs.existsSync(uploadPath)) {
						fs.mkdirSync(uploadPath, { recursive: true });
					}
					const finalPath = path.join(uploadPath, form.data.thumbnail);
					fs.renameSync(tmpPath, finalPath);
					form.data.thumbnail = `/uploads/news/${form.data.thumbnail}`;
				}
			}

			// Handle Tags
			let tagsArray: string[] | null = null;
			if (form.data.tags) {
				tagsArray = form.data.tags
					.split(',')
					.map((t: string) => t.trim())
					.filter(Boolean);
			}

			await newsService.update(event.params.id, {
				title: form.data.title,
				slug: form.data.slug,
				content: form.data.content,
				published: form.data.published,
				thumbnail: form.data.thumbnail || null,
				type: form.data.type || null,
				tags: tagsArray
			});
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_update_news() }
			});
		}

		throw redirect(303, '/panel/news');
	}
};
