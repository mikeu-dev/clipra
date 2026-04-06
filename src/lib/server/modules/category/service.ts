import type { Category, NewCategory } from '../../database/schemas';
import type { ICategoryRepository } from './interfaces/ICategoryRepository';
import type { ICategoryService } from './interfaces/ICategoryService';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService implements ICategoryService {
	constructor(private repository: ICategoryRepository) {}

	async getAll(companyId: string): Promise<Category[]> {
		return await this.repository.findAllByCompany(companyId);
	}

	async getByType(companyId: string, type: string): Promise<Category[]> {
		return await this.repository.findAllByType(companyId, type);
	}

	async getById(id: string): Promise<Category | undefined> {
		return await this.repository.findById(id);
	}

	async create(data: NewCategory): Promise<void> {
		const id = uuidv4();
		await this.repository.create({ ...data, id });
	}

	async update(id: string, data: Partial<NewCategory>): Promise<void> {
		await this.repository.update(id, data);
	}

	async delete(id: string): Promise<void> {
		await this.repository.delete(id);
	}
}
