import { z } from 'zod';

export const tagSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Tag name is required').max(100, 'Tag name is too long')
});

export type TagSchema = typeof tagSchema;
