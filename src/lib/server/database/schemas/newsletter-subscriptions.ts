import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	email: varchar('email', { length: 150 }).notNull(),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
	isSubscribed: boolean('is_subscribed').default(true),
	unsubscribeToken: varchar('unsubscribe_token', { length: 64 }),
	unsubscribedAt: timestamp('unsubscribed_at')
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
