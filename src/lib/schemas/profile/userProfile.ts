import { z } from 'zod';

// Schema untuk tabel userProfiles
export const userProfileSchema = z.object({
	userId: z.string().min(1).max(100),
	address: z.string().min(1).max(100),
	birthDate: z.string().date(),
	gender: z.enum(['male', 'female']),
	phone: z.string().max(20).optional().nullable(),
	bio: z.string().min(1).nullable()
});

export type UserProfileSchema = typeof userProfileSchema;
