import { BaseRepository } from '$lib/server/core/base.repository';
import * as table from '$lib/server/database/schemas';
import { companies } from '$lib/server/database/schemas';

export class CompanyRepository extends BaseRepository<
	typeof companies,
	table.Company,
	table.NewCompany
> {
	constructor() {
		super(companies);
	}
}
