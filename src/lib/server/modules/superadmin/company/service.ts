import { BaseService } from '$lib/server/core/base.service';
import * as table from '$lib/server/database/schemas';
import { CompanyRepository } from './repository';

export class CompanyService extends BaseService<table.Company, table.NewCompany> {
	constructor() {
		super(new CompanyRepository());
	}

	// Override or add specific methods if needed, e.g. soft delete with related data check
}
