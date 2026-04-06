import { CareerModule } from '$lib/server/modules/career/module';
import { generateId } from '$lib/utils/useUserId';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { mkdir } from 'fs/promises';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
	const careerService = CareerModule.getService();
	const job = await careerService.getBySlug(params.slug);

	if (!job) {
		return fail(404, { message: 'Lowongan tidak ditemukan' });
	}

	return {
		job
	};
};

export const actions: Actions = {
	apply: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const phone = data.get('phone') as string;
		const coverLetter = data.get('coverLetter') as string;
		const resumeServerId = data.get('resume') as string;

		// Validation (simple)
		if (!name || !email || !phone || !resumeServerId) {
			return fail(400, { message: 'Mohon lengkapi semua field wajib.' });
		}

		const careerService = CareerModule.getService();
		const job = await careerService.getBySlug(params.slug);

		if (!job) {
			return fail(404, { message: 'Lowongan tidak valid.' });
		}

		try {
			// Move file from tmp to permanent storage
			const tmpPath = path.join(process.cwd(), 'static/tmp', resumeServerId);
			if (!fs.existsSync(tmpPath)) {
				return fail(400, { message: 'File resume tidak ditemukan atau sudah kadaluwarsa.' });
			}

			const uploadDir = 'static/uploads/resumes';
			await mkdir(uploadDir, { recursive: true });

			const filename = `${Date.now()}_${resumeServerId.replace(/[^a-zA-Z0-9.]/g, '_')}`;
			const filepath = path.join(uploadDir, filename);

			await fsPromises.rename(tmpPath, filepath);

			const publicPath = `/uploads/resumes/${filename}`;

			await careerService.createApplicant({
				id: generateId(),
				jobId: job.id,
				name,
				email,
				phone,
				coverLetter: coverLetter || '',
				resume: publicPath,
				status: 'pending'
			});

			return { success: true };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			console.error(e);
			return fail(500, { message: 'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi.' });
		}
	}
};
