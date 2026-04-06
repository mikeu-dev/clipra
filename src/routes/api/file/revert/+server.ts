import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import * as m from '$lib/paraglide/messages.js';

const uploadDir = path.join(process.cwd(), 'static/tmp');

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.text(); // isinya nama file yang mau dihapus
	const filepath = path.join(uploadDir, body);

	if (fs.existsSync(filepath)) {
		fs.unlinkSync(filepath);
		return new Response(m.msg_success_delete(), { status: 200 });
	}

	return new Response('File tidak ditemukan', { status: 404 });
};
