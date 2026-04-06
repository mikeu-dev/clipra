import { ServiceService } from './service';
import { ServiceController } from './controller';

export class ServiceModule {
	private static serviceInstance: ServiceService;
	private static controllerInstance: ServiceController;

	static getService(): ServiceService {
		if (!this.serviceInstance) {
			this.serviceInstance = new ServiceService();
		}
		return this.serviceInstance;
	}

	static getController(): ServiceController {
		if (!this.controllerInstance) {
			this.controllerInstance = new ServiceController(this.getService());
		}
		return this.controllerInstance;
	}
}
