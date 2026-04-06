// src/lib/server/services/interfaces/ISchoolService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface ISchoolService extends IService<table.School, table.NewSchool, table.School> {
	getAllSchoolWithUser(): Promise<(table.School & { user: table.User | null })[]>;
}
