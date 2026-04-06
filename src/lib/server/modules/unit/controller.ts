// src/lib/server/controllers/unit.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { UnitService } from './service';
import type * as table from '$lib/server/database/schemas';

export class UnitController extends BaseController<table.Unit, table.NewUnit> {
	constructor(service = new UnitService()) {
		super(service);
	}
}
