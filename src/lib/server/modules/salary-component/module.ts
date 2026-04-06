import { SalaryComponentRepository } from './repository';
import { SalaryComponentService } from './service';

export class SalaryComponentModule {
	static getService(): SalaryComponentService {
		const repository = new SalaryComponentRepository();
		return new SalaryComponentService(repository);
	}
}
