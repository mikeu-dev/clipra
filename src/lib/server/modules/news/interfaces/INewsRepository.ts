import type * as table from '$lib/server/database/schemas';

export interface INewsRepository {
	create(data: table.NewNews): Promise<table.News>;
	update(id: string, data: Partial<table.NewNews>): Promise<void>;
	delete(id: string): Promise<void>;
	findById(id: string): Promise<table.News | null>;
	findAll(): Promise<table.News[]>;
	getBySlug(slug: string): Promise<table.News | null>;
	getAllPublished(): Promise<table.News[]>;
}
