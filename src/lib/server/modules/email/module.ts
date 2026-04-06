import { EmailService } from './service';

export class EmailModule {
	static getService(): EmailService {
		return new EmailService();
	}
}
