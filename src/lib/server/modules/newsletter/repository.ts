// src/lib/server/repositories/newsletter.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import { db } from '$lib/server/database';
import { eq } from 'drizzle-orm';
import type { INewsletterRepository } from './interfaces/INewsletterRepository';

export class NewsletterRepository
	extends BaseRepository<
		typeof table.newsletterSubscriptions,
		table.NewsletterSubscription,
		table.NewNewsletterSubscription
	>
	implements INewsletterRepository
{
	constructor() {
		super(table.newsletterSubscriptions);
	}

	async getByEmail(email: string): Promise<table.NewsletterSubscription | null> {
		const result = await db
			.select()
			.from(table.newsletterSubscriptions)
			.where(eq(table.newsletterSubscriptions.email, email));
		return result[0] ?? null;
	}

	async getAllActive(): Promise<table.NewsletterSubscription[]> {
		return await db
			.select()
			.from(table.newsletterSubscriptions)
			.where(eq(table.newsletterSubscriptions.isSubscribed, true));
	}
}
