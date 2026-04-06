import type { Category, NewCategory } from '../../../database/schemas';

export interface ICategoryService {
	getAll(companyId: string): Promise<Category[]>;
	getByType(companyId: string, type: string): Promise<Category[]>;
	getById(id: string): Promise<Category | undefined>;
	create(data: NewCategory): Promise<void>;
	update(id: string, data: Partial<NewCategory>): Promise<void>;
	delete(id: string): Promise<void>;
}
