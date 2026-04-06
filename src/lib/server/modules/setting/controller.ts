import * as table from '$lib/server/database/schemas';
import { SettingService } from './service';

export class SettingController {
	private service: SettingService;

	constructor(service: SettingService = new SettingService()) {
		this.service = service;
	}

	async index() {
		return await this.service.getAll();
	}

	async show(id: string) {
		return await this.service.getById(id);
	}

	async getByKey(group: string, key: string) {
		return await this.service.getByKey(group, key);
	}

	async store(data: table.NewSetting) {
		return await this.service.create(data);
	}

	async update(id: string, data: Partial<table.Setting>) {
		return await this.service.update(id, data);
	}

	async upsert(data: { group: string; key: string; value: string; description?: string | null }) {
		return await this.service.upsertByKey(data);
	}

	async destroy(id: string) {
		return await this.service.delete(id);
	}

	async getMapByGroup(group: string) {
		return await this.service.getMapByGroup(group);
	}
}
