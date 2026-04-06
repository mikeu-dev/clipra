import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { PositionRepository } from './repository';
import type { IPositionService } from './interfaces/IPositionService';

export class PositionService
	extends BaseService<table.Position, table.NewPosition>
	implements IPositionService
{
	constructor(repository = new PositionRepository()) {
		super(repository);
	}

	async findAllByCompanyId(companyId: string) {
		return await (this.repository as PositionRepository).findAllByCompanyId(companyId);
	}
}
