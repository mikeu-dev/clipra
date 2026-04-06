import { NotificationController } from './controller';
import { NotificationRepository } from './repository';
import { NotificationService } from './service';

export class NotificationModule {
	static getService(): NotificationService {
		const repository = new NotificationRepository();
		return new NotificationService(repository);
	}

	static getController(): NotificationController {
		const service = this.getService();
		return new NotificationController(service);
	}
}
