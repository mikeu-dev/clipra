// src/lib/server/controllers/page.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { PageService } from './service';
import type * as table from '$lib/server/database/schemas';

export class PageController extends BaseController<table.Page, table.NewPage> {
	constructor(service = new PageService()) {
		super(service);
	}
}
