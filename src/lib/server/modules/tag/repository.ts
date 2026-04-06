import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { ITagRepository } from './interfaces/ITagRepository';

export class TagRepository
	extends BaseRepository<typeof table.tags, table.Tag, table.NewTag>
	implements ITagRepository
{
	constructor() {
		super(table.tags);
	}
}
