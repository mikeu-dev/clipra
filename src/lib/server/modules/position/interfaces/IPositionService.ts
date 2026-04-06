import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IPositionService extends IService<
	table.Position,
	table.NewPosition,
	table.Position
> {
	findAllByCompanyId(companyId: string): Promise<table.Position[]>;
}
