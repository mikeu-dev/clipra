// src/lib/server/repositories/interfaces/INewsletterRepository.ts
import type * as table from '$lib/server/database/schemas';

export interface INewsletterRepository {
	findAll(): Promise<table.NewsletterSubscription[]>;
	findById(id: string): Promise<table.NewsletterSubscription | null>;
	create(data: table.NewNewsletterSubscription): Promise<table.NewsletterSubscription>;
	update(id: string, data: Partial<table.NewsletterSubscription>): Promise<void>;
	delete(id: string): Promise<void>;
	getByEmail(email: string): Promise<table.NewsletterSubscription | null>;
}
