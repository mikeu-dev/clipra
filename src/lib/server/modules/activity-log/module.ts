// src/lib/server/modules/activity-log.module.ts
import { ActivityLogRepository } from './repository';
import { ActivityLogService } from './service';
import { ActivityLogController } from './controller';
import { ActivityLogMapper } from './mapper';

export class ActivityLogModule {
	static getService(): ActivityLogService {
		const repository = new ActivityLogRepository();
		const mapper = new ActivityLogMapper();
		return new ActivityLogService(repository, mapper);
	}

	static create() {
		const service = this.getService();
		return new ActivityLogController(service);
	}
}
