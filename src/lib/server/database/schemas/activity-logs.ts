import { pgTable, varchar, timestamp, text, json } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

export const activityLogs = pgTable('activity_logs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userId: varchar('user_id', { length: 36 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	action: varchar('action', { length: 255 }).notNull(),
	entityType: varchar('entity_type', { length: 64 }),
	entityId: varchar('entity_id', { length: 36 }),
	meta: text('meta'),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),
	before: json('before'),
	after: json('after'),
	createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	user: one(users, { fields: [activityLogs.userId], references: [users.id] })
}));

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
