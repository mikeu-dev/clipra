import { DashboardService } from './service';

export class DashboardModule {
	private static service: DashboardService;

	static getService(): DashboardService {
		if (!this.service) {
			this.service = new DashboardService();
		}
		return this.service;
	}
}
