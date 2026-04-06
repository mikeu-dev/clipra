import { PasswordResetController } from './controller';
import { PasswordResetRepository } from './repository';
import { PasswordResetService } from './service';

export class PasswordResetModule {
	static getService(): PasswordResetService {
		const repository = new PasswordResetRepository();
		return new PasswordResetService(repository);
	}

	static create(): PasswordResetController {
		return new PasswordResetController();
	}
}
