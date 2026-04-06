// src/lib/server/services/religion.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { ReligionRepository } from './repository';
import type { IReligionService } from './interfaces/IReligionService';

export class ReligionService
	extends BaseService<table.Religion, table.NewReligion>
	implements IReligionService
{
	constructor(repository = new ReligionRepository()) {
		super(repository);
	}
}
