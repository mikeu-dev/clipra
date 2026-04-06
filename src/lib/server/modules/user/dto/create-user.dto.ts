import { z } from 'zod';
import { BaseCreateSchema } from '../../../dto/base/base.create.dto';

/**
 * DTO untuk membuat pengguna baru.
 */
export const CreateUserSchema = BaseCreateSchema.extend({
	name: z.string().min(2, 'Nama minimal 2 karakter'),
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(8, 'Kata sandi minimal 8 karakter')
});
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
