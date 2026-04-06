// src/routes/api/user/+server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { json, type RequestHandler } from '@sveltejs/kit';
import { UserModule } from '$lib/server/modules/user/module';
import { formSchema } from '$lib/server/modules/user/schemas/form';
import * as m from '$lib/paraglide/messages.js';

const userModule = UserModule.create();

export const POST: RequestHandler = async (event) => {
	const form = await superValidate(event, zod(formSchema));

	if (!form.valid) {
		return json({ success: false, errors: form.errors }, { status: 400 });
	}
	try {
		await userModule.store(event);

		return json({ success: true, message: m.msg_user_created() });
	} catch (e) {
		if (typeof e === 'object' && e !== null && 'code' in e) {
			const err = e as { code: string };
			if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
				return json(
					{
						success: false,
						errors: { email: ['Email sudah digunakan'] }
					},
					{ status: 400 }
				);
			}
		}

		return json({ success: false, message: m.msg_user_failed() }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const idRaw = data.id;

	if (!idRaw || typeof idRaw !== 'string' || idRaw.trim() === '') {
		return json({ success: false, message: m.msg_error_invalid_id() }, { status: 400 });
	}

	try {
		await userModule.destroy(idRaw);
		return json({ success: true, message: m.msg_user_deleted() });
	} catch (e: unknown) {
		console.error('[ERROR] Gagal menghapus user:', e);
		return json({ success: false, message: m.msg_user_delete_failed() }, { status: 500 });
	}
};
