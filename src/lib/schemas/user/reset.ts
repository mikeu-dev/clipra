import { z } from 'zod';

export const resetSchema = z.object({
	id: z.string().nonempty('ID tidak boleh kosong')
});

export type ResetSchema = typeof resetSchema;
