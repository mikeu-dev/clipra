import { ReportingService } from './service';

export class ReportingModule {
	private static service: ReportingService;

	static getService(): ReportingService {
		if (!this.service) {
			this.service = new ReportingService();
		}
		return this.service;
	}
}
