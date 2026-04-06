import { ClientController } from './controller';

import { ClientService } from './service';

export class ClientModule {
	static getService(companyId?: string): ClientService {
		return new ClientService(companyId);
	}

	static create(): ClientController {
		const service = this.getService();
		return new ClientController(service);
	}
}
