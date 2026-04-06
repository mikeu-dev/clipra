import { BaseController } from '$lib/server/core/base.controller';
import { CompanyService } from './service';
import * as table from '$lib/server/database/schemas';

export class CompanyController extends BaseController<table.Company, table.NewCompany> {
	constructor() {
		super(new CompanyService());
	}
}
