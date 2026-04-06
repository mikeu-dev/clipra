// src/lib/server/services/interfaces/INewsletterService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export interface INewsletterService extends IService<
	table.NewsletterSubscription,
	table.NewNewsletterSubscription,
	table.NewsletterSubscription
> {
	getNewsletterByEmail(email: string): Promise<table.NewsletterSubscription | null>;
	subscribe(email: string): Promise<void>;
}
