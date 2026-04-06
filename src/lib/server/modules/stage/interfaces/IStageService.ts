// src/lib/server/services/interfaces/IStageService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IStageService = IService<table.Stage, table.NewStage, table.Stage>;
