import { pgTable, varchar, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { roles } from './roles';
import { permissions } from './permissions';

// TABEL ROLE_PERMISSIONS (Pivot)
export const rolePermissions = pgTable(
	'role_permissions',
	{
		roleId: varchar('role_id', { length: 36 })
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: varchar('permission_id', { length: 36 })
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roleId, t.permissionId] })
	})
);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	})
}));

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
