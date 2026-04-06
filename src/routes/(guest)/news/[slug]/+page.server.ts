import type { PageServerLoad } from './$types';
import { NewsModule } from '$lib/server/modules/news/module';
import { error } from '@sveltejs/kit';

const newsService = NewsModule.getService();

export const load: PageServerLoad = async ({ params }) => {
	const news = await newsService.getBySlug(params.slug);

	if (!news || !news.published) {
		throw error(404, 'News not found');
	}

	return {
		news
	};
};
