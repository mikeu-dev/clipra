import type { IRepository } from '$lib/server/core/interfaces/IRepository';
import type * as table from '$lib/server/database/schemas';

export interface IEmployeeRepository extends IRepository<table.Employee, table.NewEmployee> {
	findAllWithDetails(): Promise<unknown[]>;
}
