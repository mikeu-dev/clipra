import { pgTable, varchar, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { permissions } from './permissions';

// TABEL USER_PERMISSIONS (Pivot)
export const userPermissions = pgTable(
	'user_permissions',
	{
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		permissionId: varchar('permission_id', { length: 36 })
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.permissionId] })
	})
);

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
	user: one(users, {
		fields: [userPermissions.userId],
		references: [users.id]
	}),
	permission: one(permissions, {
		fields: [userPermissions.permissionId],
		references: [permissions.id]
	})
}));

export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
