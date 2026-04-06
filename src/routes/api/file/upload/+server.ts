import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { error } from '@sveltejs/kit';
// import { FileType } from 'file-type'; // Removed unused import to fix lint

// folder penyimpanan sementara
const uploadDir = path.join(process.cwd(), 'static/tmp');

// 5MB limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

export const POST: RequestHandler = async ({ request, locals }) => {
	console.log('--- Mulai upload file ---');

	// 1. Authentication Check
	if (!locals.user) {
		console.log('Unauthorized upload attempt');
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	console.log('FormData keys: ', Array.from(formData.keys()));

	// ambil file pertama yang benar-benar File/Blob
	let file: File | null = null;
	for (const value of formData.values()) {
		if ((value as unknown) instanceof File) {
			file = value as unknown as File;
			break;
		}
	}

	if (!file) {
		console.log('File tidak ditemukan di formData');
		return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), { status: 400 });
	}

	// 2. Size Validation
	if (file.size > MAX_FILE_SIZE) {
		console.log('File too large:', file.size);
		return new Response(JSON.stringify({ error: 'File size exceeds 5MB limit' }), { status: 400 });
	}

	// 3. Type Validation (Basic MIME check)
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		console.log('Invalid file type:', file.type);
		return new Response(
			JSON.stringify({ error: 'Invalid file type. Only images and PDF allowed.' }),
			{ status: 400 }
		);
	}

	// file info
	const fileName = file.name;
	const fileSize = file.size;
	console.log('File ditemukan:', fileName, fileSize, 'bytes');

	// buat folder jika belum ada
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
		console.log('Folder upload dibuat:', uploadDir);
	}

	// baca isi file menjadi buffer
	const arrayBuffer = await file.arrayBuffer(); // Node >=18 sudah support
	const buffer = Buffer.from(arrayBuffer);

	// 4. Randomize Filename to prevent overwrites/guessing
	const randomString = crypto.randomUUID();
	const ext = path.extname(fileName) || '.bin';
	const safeFilename = `${Date.now()}-${randomString}${ext}`;
	const filepath = path.join(uploadDir, safeFilename);

	fs.writeFileSync(filepath, buffer);
	console.log('File tersimpan di:', filepath);

	// return path relatif
	return new Response(safeFilename, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
