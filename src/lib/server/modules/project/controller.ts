// src/lib/server/controllers/project.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { ProjectService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ProjectController extends BaseController<table.Project, table.NewProject> {
	constructor(service = new ProjectService()) {
		super(service);
	}
}
