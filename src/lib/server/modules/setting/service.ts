import { SettingRepository } from './repository';
import * as table from '$lib/server/database/schemas';
import { generateId } from '$lib/utils/useUserId';

export class SettingService {
	private repository: SettingRepository;

	constructor(repository: SettingRepository = new SettingRepository()) {
		this.repository = repository;
	}

	async getAll() {
		return this.repository.findAll();
	}

	async getById(id: string) {
		return this.repository.findById(id);
	}

	async getByKey(group: string, key: string) {
		return this.repository.findByKey(group, key);
	}

	async create(data: table.NewSetting) {
		return this.repository.insert(data);
	}

	async update(id: string, data: Partial<table.Setting>) {
		return this.repository.update(id, data);
	}

	async delete(id: string) {
		return this.repository.delete(id);
	}

	async upsertByKey({
		group,
		key,
		value,
		description = null
	}: {
		group: string;
		key: string;
		value: string;
		description?: string | null;
	}) {
		const existing = await this.repository.findIdByGroupKey(group, key);
		const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

		if (existing.length > 0) {
			return this.repository.update(existing[0].id, {
				value: serializedValue,
				description,
				updatedAt: new Date()
			});
		} else {
			return this.repository.insert({
				id: generateId(),
				group,
				key,
				value: serializedValue,
				description,
				createdAt: new Date()
			});
		}
	}

	async getMapByGroup(group: string) {
		return this.repository.findMapByGroup(group);
	}
}
