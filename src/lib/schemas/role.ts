import { z } from 'zod';

export const roleSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(64, 'Name is too long'),
	description: z.string().max(255, 'Description is too long').optional()
});

export type RoleSchema = typeof roleSchema;
