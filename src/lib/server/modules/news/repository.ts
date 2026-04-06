import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import { db } from '$lib/server/database';
import { eq, desc } from 'drizzle-orm';
import type { INewsRepository } from './interfaces/INewsRepository';

export class NewsRepository
	extends BaseRepository<typeof table.news, table.News, table.NewNews>
	implements INewsRepository
{
	constructor() {
		super(table.news);
	}

	async getBySlug(slug: string): Promise<table.News | null> {
		const result = await db.select().from(table.news).where(eq(table.news.slug, slug));
		return result[0] ?? null;
	}

	async getAllPublished(): Promise<table.News[]> {
		return await db
			.select()
			.from(table.news)
			.where(eq(table.news.published, true))
			.orderBy(desc(table.news.createdAt));
	}
}
