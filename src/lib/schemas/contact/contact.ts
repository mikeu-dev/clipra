import { z } from 'zod';

// Schema untuk tabel contacts
export const contactSchema = z.object({
	firstName: z.string().min(1).max(100),
	lastName: z.string().min(1).max(100),
	company: z.string().max(150).optional().nullable(),
	email: z.string().email().max(150),
	phoneNumber: z.string().max(20).optional().nullable(),
	message: z.string().min(1),
	agreedPolicy: z.boolean().default(false),
	replyMessage: z.string().min(1).nullable()
});

export type ContactSchema = typeof contactSchema;
