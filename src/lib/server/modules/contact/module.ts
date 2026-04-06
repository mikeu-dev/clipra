import { ContactController } from './controller';
import { ContactRepository } from './repository';
import { ContactService } from './service';

export class ContactModule {
	static getService(): ContactService {
		const repository = new ContactRepository();
		return new ContactService(repository);
	}

	static create(): ContactController {
		const service = this.getService();
		return new ContactController(service);
	}
}
