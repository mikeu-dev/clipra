import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { announcements } from './announcements';

// TABEL ANNOUNCEMENT_RECIPIENTS (tracking siapa yang menerima & sudah baca)
export const announcementRecipients = pgTable(
	'announcement_recipients',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		announcementId: varchar('announcement_id', { length: 36 })
			.notNull()
			.references(() => announcements.id, { onDelete: 'cascade' }),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id),
		readAt: timestamp('read_at'),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		index('idx_ar_announcement').on(table.announcementId),
		index('idx_ar_user').on(table.userId),
		index('idx_ar_announcement_user').on(table.announcementId, table.userId)
	]
);

export const announcementRecipientsRelations = relations(announcementRecipients, ({ one }) => ({
	announcement: one(announcements, {
		fields: [announcementRecipients.announcementId],
		references: [announcements.id]
	}),
	user: one(users, {
		fields: [announcementRecipients.userId],
		references: [users.id]
	})
}));

export type AnnouncementRecipient = typeof announcementRecipients.$inferSelect;
export type NewAnnouncementRecipient = typeof announcementRecipients.$inferInsert;
