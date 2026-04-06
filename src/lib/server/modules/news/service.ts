import type { INewsRepository } from './interfaces/INewsRepository';
import type { INewsService } from './interfaces/INewsService';
import type * as table from '$lib/server/database/schemas';

export class NewsService implements INewsService {
	constructor(private repository: INewsRepository) {}

	async create(data: table.NewNews): Promise<table.News> {
		return await this.repository.create(data);
	}

	async update(id: string, data: Partial<table.NewNews>): Promise<void> {
		await this.repository.update(id, data);
	}

	async delete(id: string): Promise<void> {
		await this.repository.delete(id);
	}

	async getById(id: string): Promise<table.News> {
		const item = await this.repository.findById(id);
		if (!item) throw new Error(`News with id ${id} not found`);
		return item;
	}

	async getBySlug(slug: string): Promise<table.News | null> {
		return await this.repository.getBySlug(slug);
	}

	async getAll(): Promise<table.News[]> {
		// Default validation/sorting logic can be added here if needed
		// For now, delegating to findAll which usually returns all records
		return await this.repository.findAll();
	}

	async getAllPublished(): Promise<table.News[]> {
		return await this.repository.getAllPublished();
	}
}
