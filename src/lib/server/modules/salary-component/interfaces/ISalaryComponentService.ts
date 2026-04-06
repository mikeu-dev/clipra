import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface ISalaryComponentService extends IService<
	table.SalaryComponent,
	table.NewSalaryComponent,
	table.SalaryComponent
> {
	findAllByCompanyId(companyId: string): Promise<table.SalaryComponent[]>;
}
