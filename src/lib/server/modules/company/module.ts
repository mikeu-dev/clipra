import { CompanyService } from './service';

export class CompanyModule {
	private static serviceInstance: CompanyService;

	static getService(): CompanyService {
		if (!this.serviceInstance) {
			this.serviceInstance = new CompanyService();
		}
		return this.serviceInstance;
	}
}
