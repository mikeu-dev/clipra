import { ShiftController } from './controller';
import { ShiftRepository } from './repository';
import { ShiftService } from './service';

export class ShiftModule {
	static getService(): ShiftService {
		const repository = new ShiftRepository();
		return new ShiftService(repository);
	}

	static create(): ShiftController {
		const service = this.getService();
		return new ShiftController(service);
	}
}
