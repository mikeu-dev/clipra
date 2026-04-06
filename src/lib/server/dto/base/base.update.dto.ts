import { z } from 'zod';

/**
 * DTO dasar untuk operasi "update".
 * Cocok untuk entitas yang memiliki ID unik (UUID atau string).
 */
export const BaseUpdateSchema = z.object({
	id: z.string().uuid('ID tidak valid'),
	updatedBy: z.string().optional()
});
export type BaseUpdateDTO = z.infer<typeof BaseUpdateSchema>;
