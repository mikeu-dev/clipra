import { PositionController } from './controller';
import { PositionRepository } from './repository';
import { PositionService } from './service';

export class PositionModule {
	static getService(): PositionService {
		const repository = new PositionRepository();
		return new PositionService(repository);
	}

	static create(): PositionController {
		const service = this.getService();
		return new PositionController(service);
	}
}
