import { BaseRepository } from '../../core/base.repository';
import * as table from '$lib/server/database/schemas';

export class CompanyRepository extends BaseRepository<
	typeof table.companies,
	table.Company,
	table.NewCompany
> {
	constructor() {
		super(table.companies);
	}

	// Additional methods if needed
}
