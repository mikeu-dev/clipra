import { ProjectController } from './controller';
import { ProjectRepository } from './repository';
import { ProjectService } from './service';

export class ProjectModule {
	static getService(): ProjectService {
		const repository = new ProjectRepository();
		return new ProjectService(repository);
	}

	static create(): ProjectController {
		const service = this.getService();
		return new ProjectController(service);
	}
}
