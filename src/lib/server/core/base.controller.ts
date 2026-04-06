// src/lib/server/core/base.controller.ts
import type { RequestEvent } from '@sveltejs/kit';
import type { IService } from './interfaces/IService';

export abstract class BaseController<TEntity, TCreate, TDTO = TEntity> {
	protected service: IService<TEntity, TCreate, TDTO>;

	constructor(service: IService<TEntity, TCreate, TDTO>) {
		this.service = service;
	}

	async index(): Promise<TDTO[]> {
		return await this.service.getAll();
	}

	async show(id: string): Promise<TDTO> {
		return await this.service.getById(id);
	}

	async store(event: RequestEvent): Promise<TDTO> {
		const data = await event.request.json();
		return await this.service.create(data);
	}

	async create(data: Omit<TCreate, 'id'>): Promise<TDTO> {
		return await this.service.create(data);
	}

	async update(event: RequestEvent, id: string) {
		const data: Partial<TCreate> = await event.request.json();
		return await this.service.update(id, data);
	}

	async destroy(id: string) {
		return await this.service.delete(id);
	}
}
