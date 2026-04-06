// src/lib/server/controllers/position.controller.ts
import type * as table from '$lib/server/database/schemas';
import { BaseController } from '../../core/base.controller';
import { PositionService as PositionServiceImpl } from './service';
import type { IPositionService } from './interfaces/IPositionService';

export class PositionController extends BaseController<table.Position, table.NewPosition> {
	protected override service: IPositionService;

	constructor(service: IPositionService = new PositionServiceImpl()) {
		super(service);
		this.service = service;
	}
}
