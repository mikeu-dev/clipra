import { z } from 'zod';

/**
 * DTO dasar untuk operasi "create".
 * Menyediakan struktur minimal yang dapat diperluas oleh setiap entitas.
 */
export const BaseCreateSchema = z.object({
	createdBy: z.string().optional() // opsional tergantung sistem
});
export type BaseCreateDTO = z.infer<typeof BaseCreateSchema>;
