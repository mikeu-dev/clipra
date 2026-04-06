// src/lib/server/repositories/religion.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IReligionRepository } from './interfaces/IReligionRepository';

export class ReligionRepository
	extends BaseRepository<typeof table.religions, table.Religion, table.NewReligion>
	implements IReligionRepository
{
	constructor() {
		super(table.religions);
	}
}
