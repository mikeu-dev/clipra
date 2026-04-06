import { BaseService } from '../../core/base.service';
import type * as table from '$lib/server/database/schemas';
import { CompanyRepository } from './repository';

export class CompanyService extends BaseService<table.Company, table.NewCompany, table.Company> {
	protected override repository: CompanyRepository;

	constructor() {
		const repo = new CompanyRepository();
		super(repo);
		this.repository = repo;
	}

	async updateProfile(id: string, data: Partial<table.Company>) {
		return await this.update(id, data);
	}
}
