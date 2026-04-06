import { UnitController } from './controller';
import { UnitRepository } from './repository';
import { UnitService } from './service';

export class UnitModule {
	static getService(): UnitService {
		const repository = new UnitRepository();
		return new UnitService(repository);
	}

	static create(): UnitController {
		const service = this.getService();
		return new UnitController(service);
	}
}
