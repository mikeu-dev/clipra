import type * as table from '$lib/server/database/schemas';
import type { IService } from '$lib/server/core/interfaces/IService';

export interface INewsService extends IService<table.News, table.NewNews, table.News> {
	getBySlug(slug: string): Promise<table.News | null>;
	getAllPublished(): Promise<table.News[]>;
}
