import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { ShiftRepository } from './repository';
import type { IShiftService } from './interfaces/IShiftService';

export class ShiftService
	extends BaseService<table.Shift, table.NewShift>
	implements IShiftService
{
	constructor(protected readonly repository = new ShiftRepository()) {
		super(repository);
	}

	async findAllByCompanyId(companyId: string) {
		return await this.repository.findAllByCompanyId(companyId);
	}
}
