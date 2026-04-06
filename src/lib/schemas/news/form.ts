import { z } from 'zod';

export const formSchema = z.object({
	title: z.string().min(3, 'Title is required'),
	slug: z.string().min(3, 'Slug is required'),
	content: z.string().min(10, 'Content is required'),
	thumbnail: z.string().optional(),
	type: z.string().optional(),
	tags: z.string().optional(),
	published: z.boolean().default(false)
});

export type FormSchema = typeof formSchema;
