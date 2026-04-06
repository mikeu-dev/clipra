import { z } from 'zod';

export const roleSchema = z.object({
	id: z.string().min(1, 'User ID is required'),
	roleId: z.string().min(1, 'Role is required')
});

export type RoleSchema = typeof roleSchema;
