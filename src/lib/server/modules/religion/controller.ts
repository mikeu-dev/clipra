// src/lib/server/controllers/religion.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { ReligionService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ReligionController extends BaseController<table.Religion, table.NewReligion> {
	constructor(service = new ReligionService()) {
		super(service);
	}
}
