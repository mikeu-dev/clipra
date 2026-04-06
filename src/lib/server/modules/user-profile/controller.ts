// src/lib/server/controllers/user-profile.controller.ts
import type { RequestEvent } from '@sveltejs/kit';
import { UserProfileService } from './service';

export class UserProfileController {
	private service: UserProfileService;

	constructor(service: UserProfileService = new UserProfileService()) {
		this.service = service;
	}

	async index() {
		return await this.service.getAllProfiles();
	}

	async show(id: string) {
		return await this.service.getProfileById(id);
	}

	async store(event: RequestEvent) {
		const body = await event.request.json();
		return await this.service.createProfile(body);
	}

	async update(event: RequestEvent, id: string) {
		const body = await event.request.json();
		return await this.service.updateProfile(id, body);
	}

	async destroy(id: string) {
		return await this.service.deleteProfile(id);
	}
}
