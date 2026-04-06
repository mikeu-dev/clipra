import { z } from 'zod';

export const leaveRequestSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['annual', 'sick', 'unpaid', 'other']),
	startDate: z.string().min(1, 'Start date is required'),
	endDate: z.string().min(1, 'End date is required'),
	reason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason is too long')
});

export type LeaveRequestSchema = typeof leaveRequestSchema;
