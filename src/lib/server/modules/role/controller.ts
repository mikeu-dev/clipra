// src/lib/server/controllers/role.controller.ts
import type { RequestEvent } from '@sveltejs/kit';
import { RoleService } from './service';

export class RoleController {
	private service: RoleService;

	constructor(service: RoleService = new RoleService()) {
		this.service = service;
	}

	async index() {
		return await this.service.getAllRoles();
	}

	async show(id: string) {
		return await this.service.getRoleById(id);
	}

	async store(event: RequestEvent) {
		const body = await event.request.json();
		return await this.service.createRole(body);
	}

	async update(event: RequestEvent, id: string) {
		const body = await event.request.json();
		return await this.service.updateRole(id, body);
	}

	async destroy(id: string) {
		return await this.service.deleteRole(id);
	}
}
