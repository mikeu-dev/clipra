import { SettingController } from './controller';
import { SettingRepository } from './repository';
import { SettingService } from './service';

export class SettingModule {
	static getService(): SettingService {
		const repository = new SettingRepository();
		return new SettingService(repository);
	}

	static create(): SettingController {
		const service = this.getService();
		return new SettingController(service);
	}
}
