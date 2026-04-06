// src/lib/server/controllers/client.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { ClientService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ClientController extends BaseController<table.Client, table.NewClient> {
	constructor(service = new ClientService()) {
		super(service);
	}
}
