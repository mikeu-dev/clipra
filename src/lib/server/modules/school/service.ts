// src/lib/server/services/school.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { SchoolRepository } from './repository';
import type { ISchoolService } from './interfaces/ISchoolService';
import { SchoolRepository as SchoolRepositoryImpl } from './repository';

export class SchoolService
	extends BaseService<table.School, table.NewSchool>
	implements ISchoolService
{
	protected override repository: SchoolRepository;

	constructor(repository = new SchoolRepositoryImpl()) {
		super(repository);
		this.repository = repository;
	}

	async getAllSchoolWithUser() {
		return await this.repository.findAllWithUser();
	}
}
