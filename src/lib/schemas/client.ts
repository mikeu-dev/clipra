import { z } from 'zod';

export const clientSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Nama Client wajib diisi').max(255),
	contactEmail: z.union([z.string().email('Format email tidak valid'), z.literal('')]).optional(),
	phone: z.string().max(20).optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional()
});

export type ClientSchema = typeof clientSchema;
