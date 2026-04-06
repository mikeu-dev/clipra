import { z } from 'zod';

export const categorySchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	description: z.string().optional().nullable(),
	parentId: z.string().optional().nullable(),
	type: z.string().min(1, 'Type is required'),
	color: z.string().optional().nullable(),
	icon: z.string().optional().nullable()
});

export type CategorySchema = typeof categorySchema;
