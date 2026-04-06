import { z } from 'zod';
import { BaseUpdateSchema } from '../../../dto/base/base.update.dto';

/**
 * DTO untuk memperbarui role pengguna.
 */
export const UpdateUserRoleSchema = BaseUpdateSchema.extend({
	roleId: z.string().min(1, 'Role ID tidak valid')
});
export type UpdateUserRoleDTO = z.infer<typeof UpdateUserRoleSchema>;
