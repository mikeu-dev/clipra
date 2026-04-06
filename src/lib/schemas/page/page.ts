import { z } from 'zod';

export const pageSchema = z.object({
	title: z.string().min(3).max(50),
	description: z.string(),
	content: z.string().min(1, { message: 'Konten tidak boleh kosong' }),
	published: z.boolean().optional().default(false)
});

export type PageSchema = typeof pageSchema;
