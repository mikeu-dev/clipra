// activity-log/dto/create.dto.ts
import { z } from 'zod';
import { BaseCreateSchema } from '../../../dto/base/base.create.dto';

/**
 * DTO untuk membuat activity log baru.
 */
export const CreateActivityLogSchema = BaseCreateSchema.extend({
	userId: z.string().uuid('userId harus berupa UUID'),
	action: z.string().min(1, 'Action tidak boleh kosong'),
	entityType: z.string().max(64).optional(),
	entityId: z.string().uuid().optional(),
	meta: z.record(z.any()).optional(), // gunakan z.record(z.any()) untuk JSON object
	ipAddress: z.string().max(45).optional(),
	userAgent: z.string().optional(),
	before: z.record(z.any()).optional(),
	after: z.record(z.any()).optional()
});

export type CreateActivityLogDTO = z.infer<typeof CreateActivityLogSchema>;
