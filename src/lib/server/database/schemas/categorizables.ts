import { pgTable, varchar, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categories } from './categories';

// TABEL CATEGORIZABLES (Polymorphic Relation)
export const categorizables = pgTable(
	'categorizables',
	{
		categoryId: varchar('category_id', { length: 36 })
			.notNull()
			.references(() => categories.id, { onDelete: 'cascade' }),
		entityId: varchar('entity_id', { length: 36 }).notNull(),
		entityType: varchar('entity_type', { length: 64 }).notNull() // 'product', 'project', etc.
	},
	(t) => [
		primaryKey({ columns: [t.categoryId, t.entityId, t.entityType] }),
		index('idx_categorizables_entity').on(t.entityId, t.entityType)
	]
);

export const categorizablesRelations = relations(categorizables, ({ one }) => ({
	category: one(categories, { fields: [categorizables.categoryId], references: [categories.id] })
}));

export type Categorizable = typeof categorizables.$inferSelect;
export type NewCategorizable = typeof categorizables.$inferInsert;
