import { pgTable, varchar } from 'drizzle-orm/pg-core';

// TABEL TAGS (untuk sistem tagging)
export const tags = pgTable('tags', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique()
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
