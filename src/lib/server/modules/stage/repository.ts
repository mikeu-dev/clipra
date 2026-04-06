// src/lib/server/repositories/stage.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IStageRepository } from './interfaces/IStageRepository';

export class StageRepository
	extends BaseRepository<typeof table.stages, table.Stage, table.NewStage>
	implements IStageRepository
{
	constructor() {
		super(table.stages);
	}
}
