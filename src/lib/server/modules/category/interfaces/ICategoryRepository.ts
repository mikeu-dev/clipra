import type { Category, NewCategory } from '../../../database/schemas';

export interface ICategoryRepository {
	findAllByCompany(companyId: string): Promise<Category[]>;
	findAllByType(companyId: string, type: string): Promise<Category[]>;
	findById(id: string): Promise<Category | undefined>;
	create(data: NewCategory): Promise<void>;
	update(id: string, data: Partial<NewCategory>): Promise<void>;
	delete(id: string): Promise<void>;
}
