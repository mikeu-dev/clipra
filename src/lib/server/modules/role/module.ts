import { RoleController } from './controller';
import { RoleService } from './service';

export class RoleModule {
	static getService(): RoleService {
		return new RoleService();
	}

	static create(): RoleController {
		const service = this.getService();
		return new RoleController(service);
	}
}
