import { z } from 'zod';

export const salaryComponentSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	type: z.enum(['allowance', 'deduction']),
	calculationType: z.enum(['fixed', 'percentage']).default('fixed'),
	defaultAmount: z.string().default('0'),
	isActive: z.boolean().default(true)
});

export type SalaryComponentSchema = typeof salaryComponentSchema;
