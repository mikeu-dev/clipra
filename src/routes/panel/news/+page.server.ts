import type { PageServerLoad, Actions } from './$types';
import { NewsModule } from '$lib/server/modules/news/module';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { destroySchema } from '$lib/schemas/news/destroy';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

const newsService = NewsModule.getService();

export const load: PageServerLoad = async () => {
	const news = await newsService.getAll();
	const formDestroy = await superValidate(zod(destroySchema));

	return {
		news,
		formDestroy,
		count: news.length,
		page: 1 // Handle pagination if needed later
	};
};

export const actions: Actions = {
	destroy: async (event) => {
		if (!event.locals.permissions?.includes('news.delete')) {
			return fail(403, {
				message: m.error_access_denied_delete_news()
			});
		}

		const form = await superValidate(event, zod(destroySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await newsService.delete(form.data.id);
			return { form };
		} catch (e) {
			console.log(e);
			return fail(500, { form, error: { message: 'Failed to delete' } });
		}
	}
};
