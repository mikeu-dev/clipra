// src/lib/server/controllers/newsletter.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { NewsletterService } from './service';
import type * as table from '$lib/server/database/schemas';
import type { INewsletterService } from './interfaces/INewsletterService';

export class NewsletterController extends BaseController<
	table.NewsletterSubscription,
	table.NewNewsletterSubscription
> {
	protected override service: INewsletterService;
	constructor(service: INewsletterService = new NewsletterService()) {
		super(service);
		this.service = service;
	}

	async getByEmail(email: string) {
		return this.service.getNewsletterByEmail(email);
	}

	async subscribe(email: string) {
		return this.service.subscribe(email);
	}
}
