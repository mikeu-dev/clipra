import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface ICareerService extends IService<table.Job, table.NewJob> {
	getPaginated(
		page: number,
		limit: number,
		search?: string,
		status?: 'published' | 'draft' | 'closed'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }>;
}
