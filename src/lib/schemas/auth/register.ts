import { z } from 'zod';

export const formSchema = z
	.object({
		name: z.string().min(3).max(50),
		email: z.string().email(),
		password: z
			.string()
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/, {
				message:
					'Password harus memiliki 8-10 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.'
			}),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Konfirmasi password tidak cocok.',
		path: ['confirmPassword']
	});

export type FormSchema = typeof formSchema;
