import { z } from 'zod';
import { BaseCreateSchema } from '../../../dto/base/base.create.dto';

/**
 * DTO untuk membuat karyawan baru.
 */
export const CreateEmployeeSchema = BaseCreateSchema.extend({
	userId: z.string().uuid('Invalid User ID'),
	companyId: z.string().uuid('Invalid Company ID'),
	idCard: z.string().max(50).optional(),
	nik: z.string().max(20).optional(),
	positionId: z.string().uuid().optional().nullable(),
	shiftId: z.string().uuid().optional().nullable(),
	status: z
		.enum(['permanent', 'contract', 'probation', 'internship', 'resigned', 'terminated'])
		.default('probation'),
	joinDate: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	taxNumber: z.string().max(50).optional(),
	workPhone: z.string().max(20).optional(),
	workEmail: z.string().email().max(255).optional().or(z.literal('')),
	isPublic: z.boolean().default(true)
});

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;
