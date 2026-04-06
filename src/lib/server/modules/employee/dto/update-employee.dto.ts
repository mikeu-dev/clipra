import { z } from 'zod';
import { CreateEmployeeSchema } from './create-employee.dto';

/**
 * DTO untuk memperbarui data karyawan.
 * Menggunakan partial dari CreateEmployeeSchema, kecuali userId dan companyId yang biasanya tidak berubah.
 */
export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().omit({
	// userId: true,
	// companyId: true
	// In some cases we might want to move employee to another company or reassign user, but for now let's keep it flexible or omitted if strict
	// Let's allow updating everything for flexibility, but usually ID fields are immutable.
});

export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema> & { id: string };
