import { UserProfileController } from './controller';
import { UserProfileRepository } from './repository';
import { UserProfileService } from './service';

export class UserProfileModule {
	static getService(): UserProfileService {
		const repository = new UserProfileRepository();
		return new UserProfileService(repository);
	}

	static create(): UserProfileController {
		const service = this.getService();
		return new UserProfileController(service);
	}
}
