import { z } from 'zod';

export const religionSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long')
});

export type ReligionSchema = typeof religionSchema;
