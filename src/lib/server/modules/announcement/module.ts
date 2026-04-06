import { AnnouncementController } from './controller';
import { AnnouncementRepository } from './repository';
import { AnnouncementService } from './service';

export class AnnouncementModule {
	static getService(): AnnouncementService {
		const repository = new AnnouncementRepository();
		return new AnnouncementService(repository);
	}

	static getController(): AnnouncementController {
		const service = this.getService();
		return new AnnouncementController(service);
	}
}
