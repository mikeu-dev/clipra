import { z } from 'zod';

// Schema untuk tabel newsletters
export const newsletterSchema = z.object({
	email: z.string().email().max(150)
});

export type NewsletterSchema = typeof newsletterSchema;
