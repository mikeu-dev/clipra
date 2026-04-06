import { z } from 'zod';
import { BaseUpdateSchema } from '../../../dto/base/base.update.dto';

/**
 * DTO untuk memperbarui kata sandi pengguna.
 */
export const UpdateUserPasswordSchema = BaseUpdateSchema.extend({
	passwordHash: z.string().min(20, 'Hash kata sandi tidak valid')
});
export type UpdateUserPasswordDTO = z.infer<typeof UpdateUserPasswordSchema>;
