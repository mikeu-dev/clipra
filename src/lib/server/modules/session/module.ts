import { SessionController } from './controller';
import { SessionRepository } from './repository';
import { SessionService } from './service';

export class SessionModule {
	static getService(): SessionService {
		const repository = new SessionRepository();
		return new SessionService(repository);
	}

	static create(): SessionController {
		const service = this.getService();
		return new SessionController(service);
	}
}
