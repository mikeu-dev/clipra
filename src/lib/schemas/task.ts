import { z } from 'zod';

export const taskSchema = z.object({
	id: z.string().optional(),
	projectId: z.string().min(1, 'Project ID is required'),
	parentId: z.string().optional().nullable(), // untuk subtasks
	columnId: z.string().optional().nullable(), // untuk custom columns
	title: z.string().min(1, 'Title is required').max(255),
	description: z.string().optional(),
	assignedTo: z.string().optional().nullable(),
	priority: z.enum(['low', 'medium', 'high']).default('medium'),
	deadline: z.string().optional().nullable() // input type="date"
});

export type TaskSchema = typeof taskSchema;
