import { BaseService } from '$lib/server/core/base.service';
import * as table from '$lib/server/database/schemas';
import { TimesheetRepository } from './repository';

export class TimesheetService extends BaseService<table.Timesheet, table.NewTimesheet> {
	constructor(companyId?: string) {
		const repository = new TimesheetRepository(companyId);
		super(repository);
	}

	async getByUserId(userId: string) {
		return (this.repository as TimesheetRepository).getByUserId(userId);
	}
}
