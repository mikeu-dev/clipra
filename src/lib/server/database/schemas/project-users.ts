import { pgTable, varchar, primaryKey, timestamp, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { projects } from './projects';

export const projectUsers = pgTable(
	'project_users',
	{
		projectId: varchar('project_id', { length: 36 })
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.userId] }),
		idxUserId: index('idx_project_users_user_id').on(t.userId)
	})
);

export const projectUsersRelations = relations(projectUsers, ({ one }) => ({
	project: one(projects, {
		fields: [projectUsers.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectUsers.userId],
		references: [users.id]
	})
}));
