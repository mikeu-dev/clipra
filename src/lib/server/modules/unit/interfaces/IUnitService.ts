import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IUnitService extends IService<table.Unit, table.NewUnit, table.Unit> {
	findAllWithUser(): Promise<(table.Unit & { user: table.User | null })[]>;
}
