// src/lib/server/services/page.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { PageRepository } from './repository';
import type { IPageService } from './interfaces/IPageService';

export class PageService extends BaseService<table.Page, table.NewPage> implements IPageService {
	constructor(repository = new PageRepository()) {
		super(repository);
	}
}
