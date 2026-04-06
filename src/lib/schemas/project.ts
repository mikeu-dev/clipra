import { z } from 'zod';

export const projectSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Project Name is required').max(255),
	description: z.string().optional(),
	clientId: z.string().min(1, 'Client is required'),
	startDate: z.string().optional(), // HTML date input returns string
	dueDate: z.string().optional(),
	status: z.enum(['pending', 'active', 'completed', 'on_hold']).default('pending'),
	memberIds: z.array(z.string()).default([]),
	isPortfolio: z.boolean().default(false).optional(),
	thumbnail: z.string().optional().nullable(),
	totalBudget: z.string().or(z.number()).optional().default(0),
	estimatedHours: z.number().optional().default(0),
	latitude: z.string().optional(),
	longitude: z.string().optional()
});

export type ProjectSchema = typeof projectSchema;
