import type { PageServerLoad } from './$types';
import { NewsModule } from '$lib/server/modules/news/module';

const newsService = NewsModule.getService();

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const search = url.searchParams.get('search') || undefined;

	// Fetch all published news
	// Note: Currently getAllPublished doesn't support pagination/search in the service interface I created
	// I might need to update the service to support pagination for the public view
	const allNews = await newsService.getAllPublished();

	// Simple client-side like filtering/pagination for now since the service method returns all
	// In a real app, this should be done in the database query
	let filteredNews = allNews;
	if (search) {
		const lowerSearch = search.toLowerCase();
		filteredNews = allNews.filter(
			(n) =>
				n.title.toLowerCase().includes(lowerSearch) || n.content.toLowerCase().includes(lowerSearch)
		);
	}

	const perPage = 9;
	const total = filteredNews.length;
	const paginatedNews = filteredNews.slice((page - 1) * perPage, page * perPage);

	return {
		news: paginatedNews,
		total,
		page,
		search
	};
};
