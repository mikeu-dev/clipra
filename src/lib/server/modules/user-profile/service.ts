// src/lib/server/services/user-profile.service.ts
import type * as table from '$lib/server/database/schemas';
import { UserProfileRepository } from './repository';

export class UserProfileService {
	private repository: UserProfileRepository;

	constructor(repository: UserProfileRepository = new UserProfileRepository()) {
		this.repository = repository;
	}

	async getAllProfiles() {
		return await this.repository.findAll();
	}

	async getProfileByUserId(userId: string) {
		return await this.repository.findByUserId(userId);
	}

	async getProfileById(id: string) {
		const profile = await this.repository.findById(id);
		if (!profile) throw new Error('Profil pengguna tidak ditemukan');
		return profile;
	}

	async createProfile(data: table.NewUserProfiles) {
		if (!data.userId) throw new Error('userId wajib diisi');
		return await this.repository.create(data);
	}

	async updateProfile(id: string, data: Partial<table.UserProfiles>) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Profil pengguna tidak ditemukan');
		return await this.repository.update(id, data);
	}

	async deleteProfile(id: string) {
		const existing = await this.repository.findById(id);
		if (!existing) throw new Error('Profil pengguna tidak ditemukan');
		return await this.repository.delete(id);
	}
}
