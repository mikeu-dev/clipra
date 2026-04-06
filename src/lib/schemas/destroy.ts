import { z } from 'zod';

export const idSchema = z.object({
	id: z.string().nonempty('ID tidak boleh kosong')
});

export type IdSchema = typeof idSchema;
