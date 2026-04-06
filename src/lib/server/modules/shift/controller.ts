// src/lib/server/controllers/shift.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { ShiftService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ShiftController extends BaseController<table.Shift, table.NewShift> {
	constructor(service = new ShiftService()) {
		super(service);
	}
}
