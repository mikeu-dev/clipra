import { PresenceService } from './service';
import { PresenceController } from './controller';

export class PresenceModule {
	static getService(companyId?: string) {
		return new PresenceService(companyId);
	}

	static getController() {
		return PresenceController;
	}
}
