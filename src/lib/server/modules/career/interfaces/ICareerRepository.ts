import type { IRepository } from '$lib/server/core/interfaces/IRepository';
import type * as table from '$lib/server/database/schemas';

export interface ICareerRepository extends IRepository<table.Job, table.NewJob> {
	getPaginated(
		page: number,
		limit: number,
		search?: string,
		status?: 'published' | 'draft' | 'closed'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }>;
}
