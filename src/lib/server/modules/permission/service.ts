import type * as table from '$lib/server/database/schemas';
import { PermissionRepository } from './repository';
import { generateId } from '$lib/utils/useUserId';

export class PermissionService {
	private repository: PermissionRepository;

	constructor(repository: PermissionRepository = new PermissionRepository()) {
		this.repository = repository;
	}

	async getAllPermissions() {
		return await this.repository.findAll();
	}

	async getPermissionsByRole(roleId: string) {
		return await this.repository.findByRoleId(roleId);
	}

	async getPermissionNamesByRole(roleId: string) {
		return await this.repository.findPermissionNamesByRoleId(roleId);
	}

	async getPermissionNamesByUser(userId: string) {
		return await this.repository.findPermissionNamesByUserId(userId);
	}

	async createPermission(data: Omit<table.NewPermission, 'id'>) {
		const existing = await this.repository.findByName(data.name);
		if (existing) return existing;

		const newData = {
			id: generateId(),
			...data
		};

		await this.repository.create(newData);
		return newData;
	}

	async syncRolePermissions(roleId: string, permissionIds: string[]) {
		return await this.repository.syncRolePermissions(roleId, permissionIds);
	}

	async syncUserPermissions(userId: string, permissionIds: string[]) {
		return await this.repository.syncUserPermissions(userId, permissionIds);
	}

	async assignUnsafe(roleId: string, permissionIds: string[]) {
		return await this.repository.assignToRole(roleId, permissionIds);
	}
}
