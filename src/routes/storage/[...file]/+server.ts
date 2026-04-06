// src/routes/storage/[...file]/+server.ts
import fs from 'fs';
import path from 'path';
import mime from 'mime';

export async function GET({ params }) {
	const filePath = path.join(process.cwd(), 'storage', params.file);

	if (!fs.existsSync(filePath)) {
		return new Response('Not found', { status: 404 });
	}

	const file = await fs.promises.readFile(filePath);
	const contentType = mime.getType(filePath) || 'application/octet-stream';

	return new Response(new Uint8Array(file), {
		headers: {
			'Content-Type': contentType
		}
	});
}
