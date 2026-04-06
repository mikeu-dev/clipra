import { CategoryRepository } from './repository';
import { CategoryService } from './service';
import type { ICategoryService } from './interfaces/ICategoryService';

export class CategoryModule {
	private static service: ICategoryService;

	static getService(): ICategoryService {
		if (!this.service) {
			const repository = new CategoryRepository();
			this.service = new CategoryService(repository);
		}
		return this.service;
	}
}
