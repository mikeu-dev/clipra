// src/routes/api/contact/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { ContactModule } from '$lib/server/modules/contact/module';
import * as m from '$lib/paraglide/messages.js';

const contactController = ContactModule.create();

export const POST: RequestHandler = async (event) => {
	console.log('[RECEIVE] Menerima request POST ke /api/contact');

	try {
		// The `store` method in the controller handles the request event and JSON body.
		// The `create` method in the service will handle ID generation.
		await contactController.store(event);
		console.log('[SUCCESS] Kontak berhasil disimpan');
		return json({ success: true, message: m.msg_success_create() });
	} catch (e: unknown) {
		// Handle validation errors from the service if any
		if (e instanceof Error && e.message.includes('Validation')) {
			return json({ success: false, message: e.message }, { status: 400 });
		}
		console.error('[ERROR] Gagal menyimpan kontak:', e);
		return json({ success: false, message: m.msg_error_create() }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	console.log('[DELETE] Menerima request DELETE ke /api/contact');

	const data = await request.json();
	const idRaw = data.id;
	console.log('[SEARCH] ID yang diterima:', idRaw);

	if (!idRaw || typeof idRaw !== 'string' || idRaw.trim() === '') {
		console.warn('[WARN] ID tidak valid');
		return json({ success: false, message: 'ID tidak valid' }, { status: 400 });
	}

	try {
		await contactController.destroy(idRaw);
		console.log('[SUCCESS] Contact berhasil dihapus:', idRaw);
		return json({ success: true, message: m.msg_success_delete() });
	} catch (e: unknown) {
		console.error('[ERROR] Gagal menghapus contact:', e);
		return json({ success: false, message: m.msg_error_delete() }, { status: 500 });
	}
};
