// src/lib/server/controllers/stage.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { StageService } from './service';
import type * as table from '$lib/server/database/schemas';

export class StageController extends BaseController<table.Stage, table.NewStage> {
	constructor(service = new StageService()) {
		super(service);
	}
}
