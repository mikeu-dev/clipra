// src/lib/server/db/seed/pages/sections/hero.ts
import { Hero } from '../../../../../assets/json';
import { PageService } from '../../../../../server/modules/page/service';

const pageService = new PageService();

export async function seedPages() {
	const pageHeroData = Hero; // Assuming Hero is an object with the necessary structure (hero.json)

	console.log('Seeding pages...');
	await pageService.create({
		slug: 'hero',
		title: 'Hero Section',
		description: 'This is the hero section of the page.',
		content: JSON.stringify(pageHeroData),
		published: true,
		publishedAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date()
	});
}
