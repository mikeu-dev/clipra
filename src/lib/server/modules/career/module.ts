import { CareerService } from './service';
import { CareerRepository } from './repository';

export class CareerModule {
	static getService(): CareerService {
		const repository = new CareerRepository();
		return new CareerService(repository);
	}
}
