// src/lib/server/controllers/school.controller.ts
import type * as table from '$lib/server/database/schemas';
import { BaseController } from '../../core/base.controller';
import { SchoolService as SchoolServiceImpl } from './service';
import type { ISchoolService } from './interfaces/ISchoolService';

export class SchoolController extends BaseController<table.School, table.NewSchool> {
	protected override service: ISchoolService;

	constructor(service: ISchoolService = new SchoolServiceImpl()) {
		super(service);
		this.service = service;
	}

	async getAllSchoolWithUser() {
		return this.service.getAllSchoolWithUser();
	}
}
