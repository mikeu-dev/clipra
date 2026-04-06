import { z } from 'zod';

export const destroySchema = z.object({
	id: z.string().min(1, 'ID is required')
});

export type DestroySchema = typeof destroySchema;
