import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type ITagService = IService<table.Tag, table.NewTag, table.Tag>;
