// src/lib/server/services/interfaces/IBankService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IBankService = IService<table.Bank, table.NewBank, table.Bank>;
