import { db } from '../../database';
import { categories, type Category, type NewCategory } from '../../database/schemas';
import { eq, and } from 'drizzle-orm';
import type { ICategoryRepository } from './interfaces/ICategoryRepository';

export class CategoryRepository implements ICategoryRepository {
	async findAllByCompany(companyId: string): Promise<Category[]> {
		return await db.select().from(categories).where(eq(categories.companyId, companyId));
	}

	async findAllByType(companyId: string, type: string): Promise<Category[]> {
		return await db
			.select()
			.from(categories)
			.where(and(eq(categories.companyId, companyId), eq(categories.type, type)));
	}

	async findById(id: string): Promise<Category | undefined> {
		const [result] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
		return result;
	}

	async create(data: NewCategory): Promise<void> {
		await db.insert(categories).values(data);
	}

	async update(id: string, data: Partial<NewCategory>): Promise<void> {
		await db.update(categories).set(data).where(eq(categories.id, id));
	}

	async delete(id: string): Promise<void> {
		await db.delete(categories).where(eq(categories.id, id));
	}
}
