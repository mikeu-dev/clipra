import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { tags } from './tags';

// TABEL TAGGABLES (untuk relasi polymorphic antara tags dan entitas lain)
export const taggables = pgTable('taggables', {
	id: varchar('id', { length: 36 }).primaryKey(),
	tagId: varchar('tag_id', { length: 36 })
		.references(() => tags.id)
		.notNull()
		.unique(),
	entityType: varchar('entity_type', { length: 64 }).notNull().unique(),
	entityId: varchar('entity_id', { length: 36 }).notNull().unique()
});
