// src/lib/server/repositories/bank.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IBankRepository } from './interfaces/IBankRepository';

export class BankRepository
	extends BaseRepository<typeof table.banks, table.Bank, table.NewBank>
	implements IBankRepository
{
	constructor() {
		super(table.banks);
	}
}
