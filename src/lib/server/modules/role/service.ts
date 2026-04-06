// src/lib/server/services/role.service.ts
import type * as table from '$lib/server/database/schemas';
import { RoleRepository } from './repository';

export class RoleService {
	private repository: RoleRepository;

	constructor(repository: RoleRepository = new RoleRepository()) {
		this.repository = repository;
	}

	async getAllRoles(companyId?: string) {
		return await this.repository.findAll(companyId);
	}

	async getRoleByName(name: string) {
		const roles = await this.repository.findAll();
		return roles.find((r) => r.name === name);
	}

	async getRoleById(id: string) {
		const role = await this.repository.findById(id);
		if (!role) throw new Error('Role tidak ditemukan');
		return role;
	}

	async createRole(data: table.NewRole) {
		// validasi sederhana
		if (!data.name || data.name.trim() === '') {
			throw new Error('Nama role tidak boleh kosong');
		}
		return await this.repository.create(data);
	}

	async updateRole(id: string, data: Partial<table.Role>) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Role tidak ditemukan');
		return await this.repository.update(id, data);
	}

	async deleteRole(id: string) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Role tidak ditemukan');
		return await this.repository.delete(id);
	}
}
