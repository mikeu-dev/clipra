import { PayrollService } from './service';

export class PayrollModule {
	private static serviceInstance: PayrollService;

	static getService(): PayrollService {
		if (!this.serviceInstance) {
			this.serviceInstance = new PayrollService();
		}
		return this.serviceInstance;
	}
}
