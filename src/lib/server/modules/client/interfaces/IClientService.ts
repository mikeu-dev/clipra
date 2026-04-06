// src/lib/server/services/interfaces/IClientService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IClientService = IService<table.Client, table.NewClient, table.Client>;
