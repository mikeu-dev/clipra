import { StageController } from './controller';
import { StageRepository } from './repository';
import { StageService } from './service';

export class StageModule {
	static getService(): StageService {
		const repository = new StageRepository();
		return new StageService(repository);
	}

	static create(): StageController {
		const service = this.getService();
		return new StageController(service);
	}
}
