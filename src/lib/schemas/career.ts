import { z } from 'zod';

export const jobSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(3, 'Judul posisi minimal 3 karakter'),
	slug: z.string().optional(), // Will be generated if empty
	type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract'], {
		errorMap: () => ({ message: 'Pilih jenis pekerjaan' })
	}),
	location: z.string().min(3, 'Lokasi minimal 3 karakter'),
	description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
	requirements: z.string().optional().default(''),
	status: z.enum(['draft', 'published', 'closed']).default('draft')
});

export const applicantSchema = z.object({
	id: z.string().optional(),
	jobId: z.string(),
	name: z.string().min(3, 'Nama minimal 3 karakter'),
	email: z.string().email('Email tidak valid'),
	phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
	// resume will be handled by file upload logic separately in controller/form action
	coverLetter: z.string().optional()
});

export type JobSchema = z.infer<typeof jobSchema>;
export type ApplicantSchema = z.infer<typeof applicantSchema>;
