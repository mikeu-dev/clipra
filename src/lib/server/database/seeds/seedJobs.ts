import { db } from '../index';
import { jobs, jobApplicants } from '../schemas/index';
import { generateId } from '$lib/utils/useUserId';

export async function seedJobs() {
	console.log('  Testing seed for Jobs...');

	const jobData = [
		{
			title: 'Frontend Developer',
			slug: 'frontend-developer',
			type: 'Full-time',
			location: 'Bandung',
			description:
				'<p>Kami mencari Frontend Developer yang berpengalaman dengan Svelte dan Tailwind CSS. Anda akan bekerja dalam tim yang dinamis untuk membangun antarmuka pengguna yang menarik dan responsif.</p><h3>Tanggung Jawab:</h3><ul><li>Mengembangkan fitur antarmuka pengguna baru.</li><li>Membangun kode yang dapat digunakan kembali dan perpustakaan untuk penggunaan di masa depan.</li><li>Memastikan kelayakan teknis dari desain UI/UX.</li></ul>',
			requirements:
				'<ul><li>Pengalaman minimal 2 tahun dengan framework JavaScript modern (Svelte, React, Vue).</li><li>Memahami prinsip desain responsif.</li><li>Keahlian kuat dalam HTML, CSS, dan JavaScript.</li></ul>',
			status: 'published'
		},
		{
			title: 'Backend Engineer',
			slug: 'backend-engineer',
			type: 'Full-time',
			location: 'Remote',
			description:
				'<p>Bergabunglah dengan tim backend kami untuk membangun layanan mikro yang skalabel dan efisien. Kami menggunakan Node.js dan Go.</p>',
			requirements:
				'<ul><li>Pengalaman dengan RESTful API.</li><li>Pemahaman mendalam tentang database SQL dan NoSQL.</li><li>Kemampuan untuk menulis kode bersih dan terdokumentasi dengan baik.</li></ul>',
			status: 'published'
		},
		{
			title: 'Product Designer',
			slug: 'product-designer',
			type: 'Contract',
			location: 'Jakarta',
			description:
				'<p>Kami membutuhkan desainer produk yang kreatif untuk membantu kami merancang pengalaman pengguna terbaik.</p>',
			requirements:
				'<ul><li>Portofolio desain yang kuat.</li><li>Pengalaman dengan Figma atau alat desain serupa.</li></ul>',
			status: 'draft'
		}
	];

	for (const job of jobData) {
		// Check if job already exists
		const existingJob = await db.query.jobs.findFirst({
			where: (t, { eq }) => eq(t.slug, job.slug)
		});

		if (!existingJob) {
			const jobId = generateId();
			await db.insert(jobs).values({
				id: jobId,
				title: job.title,
				slug: job.slug,
				type: job.type,
				location: job.location,
				description: job.description,
				requirements: job.requirements,
				status: job.status
			});

			// Seed dummy applicant for the first job
			if (job.slug === 'frontend-developer') {
				await db.insert(jobApplicants).values({
					id: generateId(),
					jobId: jobId,
					name: 'Budi Santoso',
					email: 'budi@example.com',
					phone: '081234567890',
					resume: '/uploads/resumes/dummy-cv.pdf',
					coverLetter: 'Saya sangat tertarik dengan posisi ini.',
					status: 'pending'
				});
			}
		} else {
			console.log(`  Job "${job.title}" already exists. Skipping.`);
		}
	}

	console.log('  [SUCCESS] Jobs seeded successfully.');
}
