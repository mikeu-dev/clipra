import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { TagRepository } from './repository';
import type { ITagService } from './interfaces/ITagService';

export class TagService extends BaseService<table.Tag, table.NewTag> implements ITagService {
	constructor(repository = new TagRepository()) {
		super(repository);
	}
}
