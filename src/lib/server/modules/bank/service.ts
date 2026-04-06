// src/lib/server/services/bank.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { BankRepository } from './repository';
import type { IBankService } from './interfaces/IBankService';

export class BankService extends BaseService<table.Bank, table.NewBank> implements IBankService {
	constructor(repository = new BankRepository()) {
		super(repository);
	}
}
