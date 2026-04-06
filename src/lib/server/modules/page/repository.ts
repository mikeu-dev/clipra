// src/lib/server/repositories/page.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IPageRepository } from './interfaces/IPageRepository';

export class PageRepository
	extends BaseRepository<typeof table.pages, table.Page, table.NewPage>
	implements IPageRepository
{
	constructor() {
		super(table.pages);
	}
}
