import { z } from 'zod';

export const destroySchema = z.object({
	id: z.string().nonempty('ID tidak boleh kosong')
});

export type DestroySchema = typeof destroySchema;
