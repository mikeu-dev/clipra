import { EmployeeController } from './controller';

import { EmployeeService } from './service';

export class EmployeeModule {
	static getService(companyId?: string): EmployeeService {
		return new EmployeeService(companyId);
	}

	static create(): EmployeeController {
		const service = this.getService();
		return new EmployeeController(service);
	}
}
