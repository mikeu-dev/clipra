// src/lib/server/services/stage.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { StageRepository } from './repository';
import type { IStageService } from './interfaces/IStageService';

export class StageService
	extends BaseService<table.Stage, table.NewStage>
	implements IStageService
{
	constructor(repository = new StageRepository()) {
		super(repository);
	}
}
