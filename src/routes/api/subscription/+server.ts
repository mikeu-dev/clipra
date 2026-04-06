// src/routes/api/subscription/+server.ts
import { superValidate } from 'sveltekit-superforms';
import { newsletterSchema } from '$lib/schemas/newsletter/newsletter';
import { zod } from 'sveltekit-superforms/adapters';
import { json, type RequestHandler } from '@sveltejs/kit';
import { NewsletterModule } from '$lib/server/modules/newsletter/module';
import * as m from '$lib/paraglide/messages.js';

const newsletter = NewsletterModule.create();

export const POST: RequestHandler = async (event) => {
	console.log('[POST] Subscription - Mulai memproses request...');

	const form = await superValidate(event, zod(newsletterSchema));
	console.log('[POST] Validasi form:', form);

	if (!form.valid) {
		console.warn('[POST] Validasi gagal:', form.errors);
		return json({ success: false, errors: form.errors }, { status: 400 });
	}

	const { email } = form.data;
	console.log('[POST] Data valid. Email:', email);

	try {
		// [SEARCH] Cek apakah email sudah terdaftar
		const existing = await newsletter.getByEmail(email);
		if (existing) {
			console.warn('[POST] Email sudah terdaftar:', email);
			return json(
				{
					success: false,
					errors: {
						email: ['Email sudah terdaftar']
					}
				},
				{ status: 400 }
			);
		}
		await newsletter.subscribe(email);
		console.log('[POST] Subscription berhasil dibuat');
		return json({ success: true, message: m.msg_success_subscribe() });
	} catch (e: unknown) {
		if (typeof e === 'object' && e !== null && 'code' in e) {
			const err = e as { code: string };
			if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
				console.warn('[POST] Email sudah digunakan:', email);
				return json(
					{
						success: false,
						errors: {
							email: ['Email sudah digunakan']
						}
					},
					{ status: 400 }
				);
			}
		}

		return json({ success: false, message: m.msg_error_subscribe() }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	console.log('[DELETE] Subscription - Memproses request hapus');

	const data = await request.json();
	const idRaw = data.id;
	console.log('[DELETE] Data diterima:', data);

	if (!idRaw || typeof idRaw !== 'string' || idRaw.trim() === '') {
		console.warn('[DELETE] ID tidak valid:', idRaw);
		return json({ success: false, message: m.msg_error_invalid_id() }, { status: 400 });
	}

	try {
		await newsletter.destroy(idRaw as string);
		console.log('[DELETE] Subscription berhasil dihapus untuk ID:', idRaw);
		return json({ success: true, message: m.msg_success_delete_subscription() });
	} catch (e: unknown) {
		console.error('[DELETE] Gagal menghapus subscription:', e);
		return json({ success: false, message: m.msg_error_delete_subscription() }, { status: 500 });
	}
};
