// src/lib/server/services/interfaces/IPageService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IPageService = IService<table.Page, table.NewPage, table.Page>;
