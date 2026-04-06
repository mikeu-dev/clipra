import { NewsletterController } from './controller';
import { NewsletterRepository } from './repository';
import { NewsletterService } from './service';

export class NewsletterModule {
	static getService(): NewsletterService {
		const repository = new NewsletterRepository();
		return new NewsletterService(repository);
	}

	static create(): NewsletterController {
		const service = this.getService();
		return new NewsletterController(service);
	}
}
