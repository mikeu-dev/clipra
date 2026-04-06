import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { UnitRepository } from './repository';
import type { IUnitService } from './interfaces/IUnitService';

export class UnitService extends BaseService<table.Unit, table.NewUnit> implements IUnitService {
	constructor(protected readonly repository = new UnitRepository()) {
		super(repository);
	}

	async findAllWithUser() {
		return this.repository.findAllWithUser();
	}
}
