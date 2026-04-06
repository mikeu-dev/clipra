import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/schemas/auth/register';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import * as auth from '$lib/server/modules/auth/service';
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import type { Actions, PageServerLoad } from './$types';
import { generateId } from '$lib/utils/useUserId';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		throw redirect(302, '/panel');
	}
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// Ambil confirmPassword agar destructuring sesuai schema
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { name, email, password, confirmPassword } = form.data;
		// confirmPassword tidak digunakan untuk proses selanjutnya, hanya validasi

		const userId = generateId();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.users).values({
				id: userId,
				roleId: '1',
				username: email.split('@')[0],
				name,
				email,
				passwordHash,
				emailVerified: true
			});

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

			throw redirect(302, '/panel');
		} catch (e) {
			if (typeof e === 'object' && e !== null && 'code' in e) {
				const err = e as { code: string };

				console.error(err);

				// Tangani unique constraint error (email sudah ada)
				if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
					form.errors.email = ['Email sudah digunakan'];
					return fail(400, { form });
				}
			}

			// Fallback jika error lainnya
			return fail(500, { form, message: 'Terjadi kesalahan saat registrasi.' });
		}
	}
};
