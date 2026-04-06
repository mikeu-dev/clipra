import { DocumentController } from './controller';
import { DocumentRepository } from './repository';
import { DocumentService } from './service';

export class DocumentModule {
	static getService(): DocumentService {
		const repository = new DocumentRepository();
		return new DocumentService(repository);
	}

	static create(): DocumentController {
		const service = this.getService();
		return new DocumentController(service);
	}
}
