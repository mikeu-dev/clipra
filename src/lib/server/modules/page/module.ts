import { PageController } from './controller';
import { PageRepository } from './repository';
import { PageService } from './service';

export class PageModule {
	static getService(): PageService {
		const repository = new PageRepository();
		return new PageService(repository);
	}

	static create(): PageController {
		const service = this.getService();
		return new PageController(service);
	}
}
