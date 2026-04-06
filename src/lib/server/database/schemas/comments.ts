import { pgTable, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

// TABEL COMMENTS (untuk komentar pada berbagai entitas)
export const comments = pgTable(
	'comments',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		entityType: varchar('entity_type', { length: 64 }).notNull(),
		entityId: varchar('entity_id', { length: 36 }).notNull(),
		userId: varchar('user_id', { length: 36 }).references(() => users.id),
		content: text('content').notNull(),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [index('idx_comments_id').on(table.entityId)]
);

export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(users, { fields: [comments.userId], references: [users.id] })
}));
