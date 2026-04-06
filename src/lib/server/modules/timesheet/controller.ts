import { BaseController } from '$lib/server/core/base.controller';
import { TimesheetService } from './service';
import type * as table from '$lib/server/database/schemas';

export class TimesheetController extends BaseController<table.Timesheet, table.NewTimesheet> {
	constructor(serviceOrCompanyId?: TimesheetService | string) {
		const service =
			serviceOrCompanyId instanceof TimesheetService
				? serviceOrCompanyId
				: new TimesheetService(serviceOrCompanyId);
		super(service);
	}

	async getByUserId(userId: string) {
		return (this.service as TimesheetService).getByUserId(userId);
	}
}
