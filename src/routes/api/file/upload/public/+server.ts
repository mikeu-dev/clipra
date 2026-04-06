import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'static/tmp');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

export const POST: RequestHandler = async ({ request }) => {
	console.log('--- Mulai public upload file (Resume) ---');

	const formData = await request.formData();

	let file: File | null = null;
	for (const value of formData.values()) {
		if ((value as unknown) instanceof File) {
			file = value as unknown as File;
			break;
		}
	}

	if (!file) {
		return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return new Response(JSON.stringify({ error: 'File size exceeds 5MB limit' }), { status: 400 });
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return new Response(
			JSON.stringify({ error: 'Invalid file type. Only PDF allowed for resume.' }),
			{ status: 400 }
		);
	}

	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const randomString = crypto.randomUUID();
	const ext = path.extname(file.name) || '.pdf';
	const safeFilename = `resume-${Date.now()}-${randomString}${ext}`;
	const filepath = path.join(uploadDir, safeFilename);

	fs.writeFileSync(filepath, buffer);
	console.log('Public file tersimpan di:', filepath);

	return new Response(safeFilename, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
