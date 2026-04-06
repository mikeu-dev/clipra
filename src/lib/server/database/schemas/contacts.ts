import { pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const contacts = pgTable('contacts', {
	id: varchar('id', { length: 36 }).primaryKey(),
	firstName: varchar('first_name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	company: varchar('company', { length: 150 }),
	email: varchar('email', { length: 150 }).notNull(),
	phoneNumber: varchar('phone_number', { length: 20 }),
	message: text('message').notNull(),
	agreedPolicy: boolean('agreed_policy').notNull().default(false),
	isRead: boolean('is_read').notNull().default(false),
	isReplied: boolean('is_replied').notNull().default(false),
	replyMessage: text('reply_message'),
	repliedAt: timestamp('replied_at'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
