// src/lib/server/services/interfaces/IReligionService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IReligionService = IService<table.Religion, table.NewReligion, table.Religion>;
