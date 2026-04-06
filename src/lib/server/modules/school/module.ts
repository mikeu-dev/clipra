import { SchoolController } from './controller';
import { SchoolRepository } from './repository';
import { SchoolService } from './service';

export class SchoolModule {
	static getService(): SchoolService {
		const repository = new SchoolRepository();
		return new SchoolService(repository);
	}

	static create(): SchoolController {
		const service = this.getService();
		return new SchoolController(service);
	}
}
