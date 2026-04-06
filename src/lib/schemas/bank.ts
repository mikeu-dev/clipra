import { z } from 'zod';

export const bankSchema = z.object({
	id: z.string().optional(),
	code: z.string().min(1, 'Code is required').max(64, 'Code is too long'),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long')
});

export type BankSchema = typeof bankSchema;
