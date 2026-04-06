import { z } from 'zod';

export const employeeFormSchema = z.object({
	id: z.string().optional(), // For update
	userId: z.string().min(1, 'User wajib dipilih'),
	companyId: z.string().min(1, 'Perusahaan wajib dipilih'),
	nik: z.string().min(1, 'NIK wajib diisi').max(20),
	idCard: z.string().max(50).optional(),
	positionId: z.string().optional(),
	shiftId: z.string().optional(),
	status: z.enum(['permanent', 'contract', 'probation', 'internship', 'resigned', 'terminated'], {
		required_error: 'Status wajib dipilih',
		invalid_type_error: 'Status tidak valid'
	}),
	joinDate: z.string().min(1, 'Tanggal bergabung wajib diisi'),
	taxNumber: z.string().optional(),
	workPhone: z.string().optional(),
	workEmail: z.string().optional(),
	bankName: z.string().max(100).optional(),
	bankAccountNumber: z.string().max(50).optional()
});

export type EmployeeFormSchema = typeof employeeFormSchema;
