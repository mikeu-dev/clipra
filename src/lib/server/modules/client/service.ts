// src/lib/server/services/client.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { ClientRepository } from './repository';
import type { IClientService } from './interfaces/IClientService';

export class ClientService
	extends BaseService<table.Client, table.NewClient>
	implements IClientService
{
	constructor(companyId?: string) {
		super(new ClientRepository(companyId));
	}

	async getPaginated(page: number, limit: number, search?: string) {
		return (this.repository as ClientRepository).getPaginated(page, limit, search);
	}

	async getSelectOptions() {
		return (this.repository as ClientRepository).getSelectOptions();
	}

	async create(data: table.NewClient) {
		if (!data.companyId && (this.repository as ClientRepository)['companyId']) {
			data.companyId = (this.repository as ClientRepository)['companyId']!;
		}
		return super.create(data);
	}
}
