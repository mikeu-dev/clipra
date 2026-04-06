import { ReligionController } from './controller';
import { ReligionRepository } from './repository';
import { ReligionService } from './service';

export class ReligionModule {
	static getService(): ReligionService {
		const repository = new ReligionRepository();
		return new ReligionService(repository);
	}

	static create(): ReligionController {
		const service = this.getService();
		return new ReligionController(service);
	}
}
