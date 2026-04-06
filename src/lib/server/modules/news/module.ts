import { NewsController } from './controller';
import { NewsRepository } from './repository';
import { NewsService } from './service';

export class NewsModule {
	static getService(): NewsService {
		const repository = new NewsRepository();
		return new NewsService(repository);
	}

	static create(): NewsController {
		const service = this.getService();
		return new NewsController(service);
	}
}
