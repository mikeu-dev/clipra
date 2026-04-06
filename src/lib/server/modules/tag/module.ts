import { TagRepository } from './repository';
import { TagService } from './service';

export class TagModule {
	static getService(): TagService {
		const repository = new TagRepository();
		return new TagService(repository);
	}
}
