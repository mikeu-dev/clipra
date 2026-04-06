import { AttachmentController } from './controller';
import { AttachmentRepository } from './repository';
import { AttachmentService } from './service';

export class AttachmentModule {
	static getService(): AttachmentService {
		const repository = new AttachmentRepository();
		return new AttachmentService(repository);
	}

	static create(): AttachmentController {
		const service = this.getService();
		return new AttachmentController(service);
	}
}
