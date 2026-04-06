import { z } from 'zod';

// Schema untuk tabel logs
export const logSchema = z.object({
	action: z.string().min(1).max(100),
	entityType: z.string().min(1).max(100),
	meta: z.string().optional().nullable()
});

export type LogSchema = typeof logSchema;
