// src/lib/server/services/interfaces/IProjectService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IProjectService = IService<table.Project, table.NewProject, table.Project>;
