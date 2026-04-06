import { z } from 'zod';

export const unitSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	userId: z.string().min(1, 'User is required')
});

export type UnitSchema = typeof unitSchema;
