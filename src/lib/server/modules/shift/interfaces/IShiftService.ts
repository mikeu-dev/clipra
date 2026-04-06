import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface IShiftService extends IService<table.Shift, table.NewShift, table.Shift> {
	findAllByCompanyId(companyId: string): Promise<table.Shift[]>;
}
