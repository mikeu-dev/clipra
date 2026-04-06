import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(3).max(50),
	rememberMe: z.boolean().default(false)
});

export type FormSchema = typeof formSchema;
