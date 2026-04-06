// src/lib/server/controllers/activity-log.controller.ts
import type * as table from '$lib/server/database/schemas';
import { BaseController } from '../../core/base.controller';
import { ActivityLogService as ActivityLogServiceImpl } from './service';
import type { IActivityLogService } from './interfaces/IActivityLogService';
import type { SafeActivityLogResponseDTO } from './dto/response.dto';

export class ActivityLogController extends BaseController<
	table.ActivityLog,
	table.NewActivityLog,
	SafeActivityLogResponseDTO
> {
	protected override service: IActivityLogService;

	constructor(service: IActivityLogService = new ActivityLogServiceImpl()) {
		super(service);
		this.service = service;
	}

	async getAllActivityLogWithUser() {
		return this.service.getAllActivityLogWithUser();
	}

	async getByUser(userId: string) {
		return this.service.getByUser(userId);
	}
}
