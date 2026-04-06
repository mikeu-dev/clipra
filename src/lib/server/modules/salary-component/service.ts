import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { SalaryComponentRepository } from './repository';
import type { ISalaryComponentService } from './interfaces/ISalaryComponentService';

export class SalaryComponentService
	extends BaseService<table.SalaryComponent, table.NewSalaryComponent>
	implements ISalaryComponentService
{
	constructor(protected readonly repository = new SalaryComponentRepository()) {
		super(repository);
	}

	async findAllByCompanyId(companyId: string) {
		return await this.repository.findAllByCompanyId(companyId);
	}
}
