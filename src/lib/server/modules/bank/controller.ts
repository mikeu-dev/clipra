// src/lib/server/controllers/bank.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { BankService } from './service';
import type * as table from '$lib/server/database/schemas';

export class BankController extends BaseController<table.Bank, table.NewBank> {
	constructor(service = new BankService()) {
		super(service);
	}
}
